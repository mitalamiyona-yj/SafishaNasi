const db = require("../db");

// Get all services
exports.getServices = (req, res) => {
  db.query("SELECT * FROM services", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching services" });
    }
    res.json(results);
  });
};

// Create service
exports.createService = (req, res) => {
  const { name, price, description } = req.body;

  const sql = "INSERT INTO services (name, price, description) VALUES (?, ?, ?)";

  db.query(sql, [name, price, description], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error creating service" });
    }
    res.json({ message: "Service created successfully" });
  });
};

// Update service
exports.updateService = (req, res) => {
  const { name, price, description } = req.body;
  const id = req.params.id;

  const sql =
    "UPDATE services SET name=?, price=?, description=? WHERE id=?";

  db.query(sql, [name, price, description, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating service" });
    }
    res.json({ message: "Service updated successfully" });
  });
};

// Delete service
exports.deleteService = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM services WHERE id=?", [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting service" });
    }
    res.json({ message: "Service deleted successfully" });
  });
};