import axios from "axios";

const api = axios.create({
  baseURL: "http://chatapp-env.eba-5km7cj3a.us-east-1.elasticbeanstalk.com/api",
});

export default api;
