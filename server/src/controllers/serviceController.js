const { Service } = require('../models');
const upload = require('../config/multer');

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create service (Admin only)
const createService = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file ? req.file.filename : null;
    
    const service = await Service.create({
      name,
      price,
      description,
      image
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update service (Admin only)
const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { name, price, description } = req.body;
    const image = req.file ? req.file.filename : service.image;
    
    await service.update({ name, price, description, image });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete service (Admin only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.destroy();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  upload
};
