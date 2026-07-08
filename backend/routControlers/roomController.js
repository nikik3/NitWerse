import Room from "../Models/roomModel.js";

export const createRoom = async (req, res) => {
    try {
        const { name, password } = req.body;
        const currentUserID = req.user._id;

        const isPasswordProtected = !!(password && password.trim().length > 0);

        const newRoom = await Room.create({
            name,
            password: isPasswordProtected ? password : "",
            isPasswordProtected,
            participants: [currentUserID],
            creator: currentUserID
        });

        res.status(201).send({
            _id: newRoom._id,
            name: newRoom.name,
            isPasswordProtected: newRoom.isPasswordProtected,
            participants: newRoom.participants
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
        console.log(error);
    }
};

export const getRooms = async (req, res) => {
    try {
        // Return all rooms, but exclude passwords
        const rooms = await Room.find({}).select("-password");
        res.status(200).send(rooms);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
        console.log(error);
    }
};

export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { password } = req.body;
        const currentUserID = req.user._id;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).send({ success: false, message: "Room not found" });
        }

        // Check if user is already a participant
        if (room.participants.some(p => p.toString() === currentUserID.toString())) {
            return res.status(200).send({ success: true, message: "Already joined", room: { _id: room._id, name: room.name, isPasswordProtected: room.isPasswordProtected, participants: room.participants } });
        }

        // Check password if protected
        if (room.isPasswordProtected) {
            if (room.password !== password) {
                return res.status(401).send({ success: false, message: "Incorrect password" });
            }
        }

        room.participants.push(currentUserID);
        await room.save();

        res.status(200).send({
            success: true,
            room: {
                _id: room._id,
                name: room.name,
                isPasswordProtected: room.isPasswordProtected,
                participants: room.participants
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
        console.log(error);
    }
};
