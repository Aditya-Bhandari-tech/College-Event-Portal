exports.uploadProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.profilePic = {
      public_id: req.file.filename,
      url: req.file.path,
    };

    await user.save();

    res.json({
      success: true,
      message: "Profile picture uploaded",
      data: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
