import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        resource_type: { type: String, enum: ["image", "video"], default: "image" },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;
