import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { CreateUserRequest } from '../../services/api';

interface UserFormProps {
  onSubmit: (userData: CreateUserRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const roles = [
  'doctor',
  'nurse', 
  'technician',
  'inspector',
  'supervisor',
  'admin'
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  console.log('UserForm component rendered');
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    fullName: '',
    email: '',
    role: '',
    facility: '',
    state: '',
    contactInfo: '',
    deviceId: '',
    validityMonths: 12,
    notes: ''
  });

  console.log('Initial form data:', formData);

  const [errors, setErrors] = useState<Partial<CreateUserRequest>>({});

  const handleChange = (field: keyof CreateUserRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    console.log(`Field ${field} changed to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    console.log('Validating form data:', formData);
    const newErrors: Partial<CreateUserRequest> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.facility.trim()) {
      newErrors.facility = 'Facility is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    }

    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }

    if (formData.validityMonths < 1 || formData.validityMonths > 60) {
      newErrors.validityMonths = 'Validity must be between 1 and 60 months' as any;
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form validation result:', isValid);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting...');
    try {
      await onSubmit(formData);
      console.log('Form submission successful');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const generateDeviceId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const deviceId = `NSO_${timestamp}_${random}`;
    setFormData(prev => ({
      ...prev,
      deviceId
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Creating a new user will generate an activation key that the user needs to activate their device.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.role} required>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={handleChange('role')}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.state} required>
            <InputLabel>State</InputLabel>
            <Select
              value={formData.state}
              onChange={handleChange('state')}
              label="State"
            >
              {nigerianStates.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
            {errors.state && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.state}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Facility"
            value={formData.facility}
            onChange={handleChange('facility')}
            error={!!errors.facility}
            helperText={errors.facility}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Contact Information"
            value={formData.contactInfo}
            onChange={handleChange('contactInfo')}
            error={!!errors.contactInfo}
            helperText={errors.contactInfo}
            required
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Device ID"
            value={formData.deviceId}
            onChange={handleChange('deviceId')}
            error={!!errors.deviceId}
            helperText={errors.deviceId || 'Unique identifier for the user\'s device'}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            variant="outlined"
            onClick={generateDeviceId}
            fullWidth
            sx={{ height: '56px' }}
          >
            Generate Device ID
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Validity (Months)"
            type="number"
            value={formData.validityMonths}
            onChange={handleChange('validityMonths')}
            error={!!errors.validityMonths}
            helperText={errors.validityMonths || 'How long the activation key will be valid'}
            inputProps={{ min: 1, max: 60 }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange('notes')}
            helperText="Additional notes about this user"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            console.log('Test button clicked');
            console.log('Current form data:', formData);
            console.log('Current errors:', errors);
          }}
          variant="outlined"
          sx={{ mr: 'auto' }}
        >
          Debug Form
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating User...' : 'Create User & Generate Key'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;
