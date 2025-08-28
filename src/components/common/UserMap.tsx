import { LocationOn as LocationIcon, Person as PersonIcon } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import L from 'leaflet';
import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  facility: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  deviceId: string;
  registeredAt: string;
  avatar?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactInfo?: string;
}

interface UserMapProps {
  users: User[];
  height?: string | number;
}

// Custom marker icons for different user statuses
const createCustomIcon = (status: string) => {
  const color = status === 'active' ? '#10b981' : status === 'inactive' ? '#f59e0b' : '#ef4444';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to fit map bounds to markers
const FitBounds: React.FC<{ users: User[] }> = ({ users }) => {
  const map = useMap();
  
  useEffect(() => {
    if (users.length > 0) {
      const validUsers = users.filter(user => user.latitude && user.longitude);
      if (validUsers.length > 0) {
        const bounds = L.latLngBounds(
          validUsers.map(user => [user.latitude!, user.longitude!])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [users, map]);
  
  return null;
};

const UserMap: React.FC<UserMapProps> = ({ users, height = 400 }) => {
  // Filter users with valid coordinates
  const usersWithValidLocation = users.filter(user => 
    user.latitude && user.longitude && 
    user.latitude !== 0 && user.longitude !== 0
  );
  
  // Default center (Nigeria)
  const defaultCenter: [number, number] = [9.0820, 8.6753];
  
  // Filter users with valid coordinates
  const displayUsers = users.filter(user => 
    user.latitude && user.longitude && 
    user.latitude !== 0 && user.longitude !== 0
  );
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };
  
  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ height, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds users={displayUsers} />
        
        {displayUsers.map((user) => (
          <Marker
            key={user.id}
            position={[user.latitude!, user.longitude!]}
            icon={createCustomIcon(user.status)}
          >
            <Popup maxWidth={300} minWidth={250}>
              <Card elevation={0} sx={{ border: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={user.avatar}
                      sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 1.5 }}>
                    <Chip
                      label={user.status.toUpperCase()}
                      color={getStatusColor(user.status) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={user.role}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.facility}, {user.state}
                    </Typography>
                  </Box>
                  
                  {user.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Address:</strong> {user.address}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Coordinates:</strong> {user.latitude?.toFixed(6)}, {user.longitude?.toFixed(6)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Device ID:</strong> {user.deviceId}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    <strong>Last Login:</strong> {formatLastLogin(user.lastLogin)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Registered:</strong> {formatLastLogin(user.registeredAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default UserMap;
