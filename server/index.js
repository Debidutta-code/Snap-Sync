const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define schema for user data
const userDataSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  avatarimgUrl: String,
  history: [String],
  watchLater: [String],
  visits: { type: Number, default: 0 }
});

// Define schema for video data
const videoDataSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  title: String,
  description: String,
  viewsCount: Number,
  likeCount: Number,
  disLikeCount: Number,
  imgUrl: String,
  videoUrl: String,
  avatarUrl: String,
  postedAt: { type: Date, default: Date.now }, // Field to store date and time posted
});

const subscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subscribedTo: { type: String, required: true },
});

// Create models based on the schemas
const UserData = mongoose.model("alluserdatas", userDataSchema);
const VideoData = mongoose.model("allvideos", videoDataSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);

app.use(bodyParser.json());
app.use(cors());

app.get("/check-username/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await UserData.findOne({ username });
    res.json({ available: !user }); // Return true if username is available, false if it's already taken
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/check-email/:email", async (req, res) => {
  try {
    const email = req.params.email;

    // Check if the email exists in the database
    const user = await UserData.findOne({ email: email });

    if (user) {
      // If email exists, return false
      res.json({ available: false });
    } else {
      // If email does not exist, return true
      res.json({ available: true });
    }
  } catch (error) {
    console.error("Error checking email availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to handle user registration
app.post("/register", async (req, res) => {
  const { username, email, password, avatarimgUrl } = req.body;
  try {
    const newUser = new UserData({ username, email, password, avatarimgUrl });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route to handle user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserData.findOne({ email });
    if (user && user.password === password) {
      res.json({
        success: true,
        userId: user._id.toString(),
        username: user.username,
        userAvatarUrl: user.avatarimgUrl,
      });
    } else {
      res.json({ success: false, message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Route to handle video upload
app.post("/upload-video", async (req, res) => {
  const {
    userId,
    userName,
    title,
    description,
    viewsCount,
    likeCount,
    disLikeCount,
    imgUrl,
    videoUrl,
    avatarUrl,
  } = req.body;

  try {
    const newVideo = new VideoData({
      userId,
      userName,
      title,
      description,
      viewsCount,
      likeCount,
      disLikeCount,
      imgUrl,
      videoUrl,
      avatarUrl,
      postedAt: new Date(), // Set the postedAt field to the current date and time
    });

    await newVideo.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

app.get("/get-videos", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if page parameter is not provided
    const startIndex = (page - 1) * videosPerPage;

    // Fetch videos for the requested page
    const videos = await VideoData.find().skip(startIndex).limit(videosPerPage);

    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/get-my-videos", async (req, res) => {
  try {
    const { userId } = req.body;
    // Assuming VideoData is your Mongoose model
    const userVideos = await VideoData.find({ userId: userId });
    res.json(userVideos);
  } catch (error) {
    console.error("Error fetching videos:", error.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Add this route to fetch the main video
let timerId;

app.get("/main-video/:videoId/:userLoggedIn", async (req, res) => {
  const { videoId, userLoggedIn } = req.params;
  try {
    const mainVideo = await VideoData.findById(videoId);
    if (!mainVideo) {
      res.status(404).json({ success: false, message: "Main video not found" });
      return;
    }

    res.json(mainVideo); // Send mainVideo immediately

    // Clear previous timer if exists
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set new timer
    timerId = setTimeout(async () => {
      // Check if user is logged in
      if (userLoggedIn === "true") {
        // Update views count if user is logged in
        mainVideo.viewsCount += 1;
        await mainVideo.save();
      }
      timerId = null; // Reset timerId after execution
    }, 5000); // 5000 milliseconds = 5 seconds
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/allusers/:userId/avatarimg", async (req, res) => {
  const { userId } = req.params;
  try {
    const userData = await UserData.findById(userId);
    if (!userData) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ avatarimgUrl: userData.avatarimgUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/save-to-history", async (req, res) => {
  try {
    const { videoId, userId } = req.body;

    // Update the user by userId and push the new videoId into history array
    const updatedUser = await UserData.findByIdAndUpdate(
      userId,
      { $push: { history: { $each: [videoId], $slice: -40 } } }, // Push new videoId and limit the array to 30 elements
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Saved to history", user: updatedUser });
  } catch (error) {
    console.error("Error saving to history:", error);
    res.status(500).json({ error: "Failed to save to history" });
  }
});

app.get("/get-user-history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user by userId
    const user = await UserData.findById(userId);
    //   console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Send back the user's history
    res.status(200).json({ history: user.history });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

app.get("/get-video-details/:videoId", async (req, res) => {
  try {
    const videoId = req.params.videoId;

    // Find the video by videoId
    const video = await VideoData.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Send back the video details
    res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video details:", error);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
});

app.post("/add-to-watch-later", async (req, res) => {
  const { videoId, userId } = req.body;

  try {
    const user = await UserData.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Add videoId to user's watch later list
    user.watchLater.push(videoId);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding video to watch later:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Define route to fetch watch later data and corresponding videos
app.get("/get-watch-later-videos/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find user data
    const user = await UserData.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get video IDs from watch later list
    const watchLaterIds = user.watchLater;

    // Find videos corresponding to the IDs
    const videos = await VideoData.find({ _id: { $in: watchLaterIds } });

    // Return videos as JSON
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/find-searched-content/:searchedItem", async (req, res) => {
  try {
    const searchedItem = req.params.searchedItem;
    const searchWords = searchedItem
      .split(" ")
      .map((word) => new RegExp(word, "i"));
    let videos = await VideoData.find({
      $or: [
        { title: { $in: searchWords } }, // Search in title
        { description: { $in: searchWords } }, // Search in description
        { userName: { $in: searchWords } }, // Search in userName
        // Add more fields as needed
      ],
    });

    // Reverse the order of videos
    videos = videos.reverse();

    // Custom sorting based on the count of search word occurrences
    videos.sort((a, b) => {
      const countA = countSearchWordOccurrences(a, searchWords);
      const countB = countSearchWordOccurrences(b, searchWords);
      return countB - countA;
    });

    res.json(videos);
  } catch (error) {
    console.error("Error searching videos", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to count occurrences of search words in a video object
const countSearchWordOccurrences = (video, searchWords) => {
  let count = 0;
  searchWords.forEach((word) => {
    count += (video.title.match(word) || []).length;
    count += (video.description.match(word) || []).length;
    // Add more fields as needed
  });
  return count;
};

app.get("/check-subscription", (req, res) => {
  const { userId, subscriptionId } = req.query;

  Subscription.findOne({ userId: userId, subscribedTo: subscriptionId })
    .then((subscription) => {
      if (subscription) {
        res.json({ isSubscribed: true });
      } else {
        res.json({ isSubscribed: false });
      }
    })
    .catch((error) => {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ error: "Failed to check subscription status" });
    });
});

app.get("/check-subscription-for-user-profile", async (req, res) => {
  const { userId, userProfileClicked } = req.query;
  
  try {
    // Find the user profile by username
    const userProfile = await UserData.findOne({ username: userProfileClicked }).exec();
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Extract the _id from the user profile
    const userProfileId = userProfile._id;

    // Check if there is a subscription
    const subscription = await Subscription.findOne({ userId: userId, subscribedTo: userProfileId }).exec();
    
    // Return subscription status
    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ error: "Failed to check subscription status" });
  }
});



app.get("/subscribed-to-user-id/:userProfileClicked", async (req, res) => {
  try {
    const { userProfileClicked } = req.params;

    const userData = await UserData.findOne({ username: userProfileClicked });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData._id);
  } catch (error) {
    console.error("Error fetching subscribed user ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to subscribe
app.post("/subscribe-to", (req, res) => {
  const { userId, subscribedTo } = req.body;

  // Check if the subscription already exists
  Subscription.exists({ userId: userId, subscribedTo: subscribedTo })
    .then((exists) => {
      if (exists) {
        // Subscription already exists, send success response
        res.status(200).json({ message: "Already subscribed" });
      } else {
        // Create new subscription
        const newSubscription = new Subscription({
          userId: userId,
          subscribedTo: subscribedTo,
        });
        return newSubscription.save();
      }
    })
    .then(() => {
      res.status(200).json({ message: "Subscribed successfully" });
    })
    .catch((error) => {
      console.error("Error subscribing:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    });
});

app.delete("/unsubscribe", (req, res) => {
  const { userId, subscribedToUserId } = req.body;

  Subscription.deleteOne({ userId: userId, subscribedTo: subscribedToUserId })
    .then(() => {
      res.status(200).json({ message: "Unsubscribed successfully" });
    })
    .catch((error) => {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    });
});

app.get("/subscriptions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all subscriptions for the given userId
    const subscriptions = await Subscription.find({ userId });

    // Extract the ids of the subscribed users
    const subscribedUserIds = subscriptions.map(
      (subscription) => subscription.subscribedTo
    );

    // Find user data for the subscribed users
    const subscribedUsersData = await UserData.find({
      _id: { $in: subscribedUserIds },
    });

    // Send the subscribed users' data as response
    res.json(subscribedUsersData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/get-subscribed-videos/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all subscriptions for the given userId
    const subscriptions = await Subscription.find({ userId });

    // Extract the ids of the subscribed users
    const subscribedUserIds = subscriptions.map(
      (subscription) => subscription.subscribedTo
    );

    // Find videos for the subscribed users
    const subscribedVideos = await VideoData.find({
      userId: { $in: subscribedUserIds },
    });

    // Send the subscribed users' videos as response
    res.json(subscribedVideos);
  } catch (error) {
    console.error("Error fetching subscribed videos:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getSubscriberCount/:videoId", async (req, res) => {
  const { videoId } = req.params;
  try {
    // Find the video with the given videoId
    const video = await VideoData.findOne({ _id: videoId });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    // Find the subscriber count for the userId associated with the video
    const subscriberCount = await Subscription.countDocuments({
      subscribedTo: video.userId,
    });

    res.json({ subscriberCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" }); // Sending error response
  }
});

app.get(
  "/get-Subscriber-Count-with-user-name/:userProfileClicked",
  async (req, res) => {
    const { userProfileClicked } = req.params;
    try {
      // Find the video with the given videoId
      const user = await UserData.findOne({ username: userProfileClicked });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Find the subscriber count for the userId associated with the video
      const subscriberCount = await Subscription.countDocuments({
        subscribedTo: user._id,
      });

      res.json({ subscriberCount });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" }); // Sending error response
    }
  }
);

app.get("/get-all-videos-with-user-name/:userName", async (req, res) => {
  const userName = req.params.userName;
  try {
    // Find all videos with the given user name
    const videos = await VideoData.find({ userName: userName });
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get-recent-video/:userProfileClicked", async (req, res) => {
  const { userProfileClicked } = req.params;

  try {
    // Find the last video object that matches the userProfileClicked and userName
    const lastVideo = await VideoData.findOne({ userName: userProfileClicked })
      .sort({ postedAt: -1 }) // Sort by postedAt in descending order
      .exec();

    if (!lastVideo) {
      return res
        .status(404)
        .json({ message: "No video found for the specified user profile" });
    }

    res.json(lastVideo);
  } catch (error) {
    console.error("Error fetching last video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Backend code

app.get("/get-video-count/:userProfileClicked", async (req, res) => {
  const { userProfileClicked } = req.params;

  try {
    // Count the number of videos that match the userProfileClicked and userName
    const videoCount = await VideoData.countDocuments({ userName: userProfileClicked });

    res.json({ videoCount });
  } catch (error) {
    console.error("Error fetching video count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/increase-visit-count/:username', async (req, res) => {
  const { username } = req.params;
  // console.log(username);
  try {
    // Find the user data by username
    const userData = await UserData.findOne({ username });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Increase the visit count by 1
    userData.visits += 1;

    // Save the updated user data
    await userData.save();

    // Return the updated visit count
    res.json({ visitCount: userData.visits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/set-like-count/:videoId", async (req, res) => {
  try {
      const { videoId } = req.params;
      const { action } = req.body; // Extract action from the request body

      // Find the video by ID
      const video = await VideoData.findOne({ _id: videoId });

      // If the video is not found, return a 404 error
      if (!video) {
          return res.status(404).json({ success: false, message: "Video not found" });
      }

      // Increment or decrement the like count based on the action
      if (action === "like") {
          video.likeCount++;
      } else if (action === "unlike") {
          video.likeCount--;
      } else {
          return res.status(400).json({ success: false, message: "Invalid action" });
      }

      // Save the updated video
      await video.save();

      // Send a success response
      res.json({ success: true, message: "Like count updated successfully" });
  } catch (error) {
      console.error("Error updating like count:", error.message);
      // Send a 500 error response
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


app.get("/set-dislike-count/:videoId/:trueOrFalse", async (req, res) => {
  try {
    const { videoId, trueOrFalse } = req.params;
    
    // Find the video by ID
    const video = await VideoData.findOne({ _id: videoId });

    // If the video is not found, return a 404 error
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    // Increment or decrement the dislike count based on trueOrFalse parameter
    if (trueOrFalse === 'true') {
      video.disLikeCount++;
    } else {
      video.disLikeCount--;
    }

    // Save the updated video
    await video.save();

    // Send a success response
    res.json({ success: true, message: "Dislike count updated successfully" });
  } catch (error) {
    console.error("Error updating dislike count:", error.message);
    // Send a 500 error response
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
