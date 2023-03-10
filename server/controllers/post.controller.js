import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";

import Post from "../models/post.model.js";

dotenv.config();

// ENVIRONMENT VARIABLES
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// CREATE - Create a new post
export const createPost = asyncHandler(async (req, res) => {
  try {
    const { name, prompt, photo, userRef } = req.body;
    const photoUrl = await cloudinary.uploader.upload(photo);

    const newPost = await Post.create({
      name,
      prompt,
      photo: photoUrl.url,
      userRef,
    });

    res.status(200).json({ success: true, data: newPost });
  } catch (err) {
    let status = err.statusCode || 500;
    if (status === 413) {
      return res.status(413).json({
        success: false,
        message: "Image size too large. Please upload a smaller image",
      });
    } else if (status === 400) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
    } else if (status === 500) {
      res.status(500).json({
        success: false,
        message: "Unable to create a post, please try again",
      });
    }
  }
});

// READ - Get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find().populate("userRef");

    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetching posts failed, please try again",
    });
  }
});

// READ - Get a post by id
export const getPostById = asyncHandler(async (req, res) => {
  try {
    // const post = await Post.findById(req.params.id);

    const post = await Post.findById(req.params.id).populate("userRef");

    res.status(200).json({ success: true, data: post });

    console.log("\nSingle Post", post);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetching post failed, please try again",
    });
  }
});

// UPDATE - Update a post's name
export const updatePostName = asyncHandler(async (req, res) => {
  try {
    const { userRef } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { userRef },
      { new: true }
    );

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Updating post failed, please try again",
    });
  }
});

// DELETE - Delete a post
export const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Deleting post failed, please try again",
    });
  }
});

// UPDATE - Update a post's User
export const updatePostUser = asyncHandler(async (req, res) => {
  try {
    const { userRef } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { userRef },
      { new: true }
    );

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Updating post failed, ${err}`,
    });
  }
});

// READ - Get a post's User
export const getPostUser = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("userRef");

    res.status(200).json({ success: true, data: post.userRef });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetching user failed, please try again",
    });
  }
});
