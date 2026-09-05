import sharp from "sharp";
import Project from "../models/Project.js";

const TARGET_SIZE_BYTES = 500 * 1024;

async function uploadToCloudinary(file) {
  const processed = await sharp(file.buffer)
    .resize({
      width: 1200,
      height: 800,
      fit: "cover",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  let quality = 80;
  let buffer = processed;

  if (buffer.length > TARGET_SIZE_BYTES) {
    quality = Math.max(
      20,
      Math.floor((TARGET_SIZE_BYTES / buffer.length) * quality),
    );
    buffer = await sharp(file.buffer)
      .resize({
        width: 1200,
        height: 800,
        fit: "cover",
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toBuffer();
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured in .env");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "vijayasiri/projects";

  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([buffer], { type: "image/jpeg" }),
    "image.jpg",
  );
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data2 = await res.json();

  if (!res.ok) {
    console.error("Cloudinary REST error:", JSON.stringify(data2));
    throw new Error(
      data2.error?.message ||
        `Cloudinary upload failed with status ${res.status}`,
    );
  }

  return { secure_url: data2.secure_url };
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    console.error("GetProjects error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error("GetProject error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      name,
      location,
      city,
      type,
      size,
      bedrooms,
      status,
      rating,
      displayOrder,
      tags,
      featured,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      imageUrl = result.secure_url;
    }

    const project = await Project.create({
      name,
      location,
      city,
      type,
      size,
      bedrooms,
      status: status || "completed",
      rating: parseFloat(rating) || 0,
      displayOrder: parseInt(displayOrder) || 0,
      tags: tags
        ? typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : tags
        : [],
      imageUrl,
      featured: featured === "true" || featured === true,
    });

    res
      .status(201)
      .json({ success: true, message: "Project created", data: { project } });
  } catch (error) {
    console.error("CreateProject error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const {
      name,
      location,
      city,
      type,
      size,
      bedrooms,
      status,
      rating,
      displayOrder,
      tags,
      featured,
    } = req.body;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      project.imageUrl = result.secure_url;
    }

    if (name !== undefined) project.name = name;
    if (location !== undefined) project.location = location;
    if (city !== undefined) project.city = city;
    if (type !== undefined) project.type = type;
    if (size !== undefined) project.size = size;
    if (bedrooms !== undefined) project.bedrooms = bedrooms;
    if (status !== undefined) project.status = status;
    if (rating !== undefined) project.rating = parseFloat(rating) || 0;
    if (displayOrder !== undefined)
      project.displayOrder = parseInt(displayOrder) || 0;
    if (tags !== undefined) {
      project.tags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : tags;
    }
    if (featured !== undefined) {
      project.featured = featured === "true" || featured === true;
    }

    await project.save();
    res
      .status(200)
      .json({ success: true, message: "Project updated", data: { project } });
  } catch (error) {
    console.error("UpdateProject error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("DeleteProject error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getProjects, getProject, createProject, updateProject, deleteProject };
