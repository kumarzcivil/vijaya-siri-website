import User from '../models/User.js';

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    const addresses = (user.addresses || []).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    res.status(200).json({
      success: true,
      data: { addresses },
    });
  } catch (error) {
    console.error('GetAddresses error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.addresses.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add more than 10 addresses',
      });
    }

    const { label, recipientName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    const newAddress = {
      label,
      recipientName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    const saved = user.addresses[user.addresses.length - 1];

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: saved },
    });
  } catch (error) {
    console.error('AddAddress error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const user = await User.findById(userId);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { label, recipientName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    if (label !== undefined) address.label = label;
    if (recipientName !== undefined) address.recipientName = recipientName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: { address },
    });
  } catch (error) {
    console.error('UpdateAddress error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const user = await User.findById(userId);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('DeleteAddress error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const user = await User.findById(userId);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: { address },
    });
  } catch (error) {
    console.error('SetDefaultAddress error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
