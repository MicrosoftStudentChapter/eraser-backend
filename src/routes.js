const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

// BOARD ROUTES

//fetch all boards
router.get("/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        strokes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(boards);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error fetching boards" });
  }
});

//get specific board with everything in it
router.get("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Please provide id" });
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        strokes: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

//Create new boards
router.post("/boards", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() == "") {
      return res.status(400).json({ error: "Board name is required" });
    }

    const board = await prisma.board.create({
      data: { name: name.trim() },
    });
    res.status(201).json({
      board,
    });
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Error creating board" });
  }
});

//Update board name
router.put("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!id) {
      res.status(400).json({ error: "Please provide id" });
    }
    if (!name || name.trim() == "") {
      res.status(400).json({ error: "Please provide name" });
    }

    const board = await prisma.board.update({
      where: { id },
      data: { name: name.trim() },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    res.json({ msg: `${id} updated with name: ${name}` });
  } catch (err) {
    res.status(500).json({ error: "Error updating board name" });
  }
});

//Delete board (and all its strokes)
router.delete("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Please provide vaild id" });
    }

    const board = await prisma.board.delete({
      where: { id },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    res.json({ msg: `Board ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Error deleting board" });
  }
});

// STROKE ROUTES

//create new stroke
router.post("/boards/:boardId/strokes", async (req, res) => {
  try {
    const { boardId } = req.params;
    const strokeData = req.body;

    if (!boardId) {
      return res.status(400).json({ error: "Board ID is required" });
    }
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      return res.status(404).json({ error: "Board does not exist" });
    }
    const stroke = await prisma.stroke.create({
      data: {
        ...strokeData,
        boardId,
      },
    });
    res.status(201).json(stroke);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ error: "Error creating stroke" });
  }
});

// Get all strokes for a specific board
//may not be needed as there is already get specific board with strokes in it
router.get("/boards/:boardId/strokes", async (req, res) => {
  try {
    const { boardId } = req.params;
    const strokes = await prisma.stroke.findMany({
      where: { boardId },
      orderBy: {
        createdAt: "asc",
      },
    });
    res.json({ strokes });
  } catch (err) {
    res.status(500).json({ error: "Failed to get strokes" });
    console.error("Error: ", err);
  }
});

// Update stroke
router.put("/strokes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const strokeData = req.data;
    if (!id) {
      return res.status(400).json({ error: "Id required" });
    }
    const stroke = await prisma.stroke.update({
      where: { id },
      data: {
        strokeData,
      },
    });
    res.json(stroke);
  } catch (err) {
    res.status(500).json({ error: "Error updating stroke" });
  }
});

//delete stroke
router.delete("/strokes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Please provide a valid stroke ID" });
    }

    const stroke = await prisma.stroke.delete({
      where: { id },
    });

    if (!stroke) {
      return res.status(404).json({ error: "Stroke not found" });
    }

    res.json({ msg: `Stroke ${id} deleted successfully` });
  } catch (err) {
    console.error("Error deleting stroke: ", err);
    res.status(500).json({ error: "Error deleting stroke" });
  }
});
  

module.exports = router;
