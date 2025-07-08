import axios from "axios";

export const pingBackend = async (userId, posts) => {
  try {
    const response = await axios.post(
      '', // add link,
      {
        user_id: userId,
        posts: posts,
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    console.log("✅ Backend responded:", response.data);
  } catch (error) {
    console.log("❌ Error connecting to backend:", error.message);
    if (error.response) {
      console.log("Response data:", error.response.data);
      console.log("Response status:", error.response.status);
    } else if (error.request) {
      console.log("No response received:", error.request);
    } else {
      console.log("Axios config error:", error.config);
    }
  }
};
