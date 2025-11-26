import Event from "../models/Event.js";

/** CREATE EVENT */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, branch } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      branch,
      createdBy: req.user._id, // from authMiddleware
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.log("Create Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET ALL EVENTS */
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    if (events.length === 0) {
      return res.status(200).json({
        message: "No events right now"
      });
    }

    res.status(200).json({
      message: "Events fetched successfully",
      events: events
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/** GET EVENT BY ID */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/** UPDATE EVENT */
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated event
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE EVENT */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
