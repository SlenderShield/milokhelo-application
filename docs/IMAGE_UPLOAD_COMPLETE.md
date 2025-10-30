# Image Upload System - Implementation Summary

## ✅ COMPLETED

### What Was Built

1. **Image Utilities** (`src/utils/imageUtils.ts`)
   - Permission handling for camera and media library
   - Image picker for camera and gallery
   - Image compression with quality control
   - Thumbnail generation
   - Base64 conversion for API uploads
   - File size validation and formatting
   - Automatic preparation for upload (compress + validate)

2. **Image Picker Component** (`src/components/ImagePicker.tsx`)
   - Modal with camera/gallery selection
   - Custom trigger support (pass your own button as children)
   - Automatic compression before callback
   - Error handling with user-friendly alerts
   - Processing overlay during compression
   - Permission request handling
   - Disabled state support

3. **Avatar Component** (`src/components/Avatar.tsx`)
   - Display user/team avatars with fallback to initials
   - Consistent color generation from names
   - Customizable size, border, and styling
   - Avatar Group component for multiple avatars with overlap
   - Automatic initial extraction (first name + last name)
   - Image loading with proper resize modes

4. **Profile Edit Integration** (`app/(main)/profile/edit.tsx`)
   - Avatar picker with camera badge indicator
   - Image selection with compression
   - Preview of selected image
   - Upload preparation (ready for backend integration)

5. **Team Edit Integration** (`app/(main)/teams/[id]/edit.tsx`)
   - Team logo picker
   - Same functionality as profile
   - Captain-only access control maintained

6. **App Configuration** (`app.json`)
   - iOS camera and photo library permissions
   - Android camera and storage permissions
   - Permission descriptions for app stores

### Packages Installed

- ✅ `expo-image-picker` - Camera and gallery access
- ✅ `expo-image-manipulator` - Image compression and resizing

### Features

#### Image Selection

- **Dual Source**: Choose from camera or gallery
- **Square Crop**: 1:1 aspect ratio for avatars/logos
- **Permission Handling**: Automatic permission requests
- **User-Friendly**: Clear error messages and guidance

#### Image Processing

- **Automatic Compression**: Reduces file size while maintaining quality
- **Configurable Options**:
  - Max width/height (default: 1024x1024)
  - Quality (0-1, default: 0.8)
  - Max file size (default: 5MB)
- **Progressive Compression**: If too large, compresses more aggressively
- **Thumbnail Generation**: Create smaller versions for lists

#### Avatar Display

- **Smart Fallbacks**: Shows initials when no image
- **Consistent Colors**: Same name = same color always
- **16 Colors**: Diverse color palette for variety
- **Flexible Sizing**: Any size with automatic font scaling
- **Border Customization**: Color and width

#### Integration

- **Profile Pictures**: User avatars in profile edit
- **Team Logos**: Team images in team edit
- **Easy Integration**: Simple props interface
- **Reusable**: Use anywhere in the app

## 🔧 Backend Integration Required

### Upload Endpoint

The app currently stores image URIs locally. To complete the integration, the backend needs to implement:

```typescript
// POST /api/upload/image
interface UploadImageRequest {
  image: string; // base64 encoded image
  type: 'avatar' | 'team-logo' | 'venue-image';
}

interface UploadImageResponse {
  url: string; // Public URL of uploaded image
  thumbnailUrl?: string; // Optional thumbnail URL
}
```

### Update User Endpoint

```typescript
// PATCH /api/users/me
interface UpdateUserRequest {
  name?: string;
  bio?: string;
  location?: string;
  avatar?: string; // URL from upload endpoint
}
```

### Update Team Endpoint

```typescript
// PATCH /api/teams/:id
interface UpdateTeamRequest {
  name?: string;
  sport?: string;
  description?: string;
  avatar?: string; // URL from upload endpoint
}
```

### Implementation Steps

1. **Create Upload Utility** (when backend is ready):

```typescript
// src/utils/uploadImage.ts
import { imageToBase64 } from './imageUtils';

export async function uploadImage(uri: string, type: 'avatar' | 'team-logo'): Promise<string> {
  const base64 = await imageToBase64(uri);

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64, type }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}
```

2. **Update Profile Edit** (`app/(main)/profile/edit.tsx`):

```typescript
// Replace TODO in handleSubmit with:
if (avatarUri && avatarUri !== user?.avatar) {
  setUploadingImage(true);
  try {
    const imageUrl = await uploadImage(avatarUri, 'avatar');
    userData.avatar = imageUrl;
  } catch (error) {
    Alert.alert('Error', 'Failed to upload image');
    return;
  } finally {
    setUploadingImage(false);
  }
}
```

3. **Update Team Edit** (`app/(main)/teams/[id]/edit.tsx`):

```typescript
// Replace TODO in handleSubmit with:
if (logoUri && logoUri !== team?.avatar) {
  setUploadingImage(true);
  try {
    const imageUrl = await uploadImage(logoUri, 'team-logo');
    teamData.avatar = imageUrl;
  } catch (error) {
    Alert.alert('Error', 'Failed to upload team logo');
    return;
  } finally {
    setUploadingImage(false);
  }
}
```

## 📱 How to Use

### Using ImagePickerComponent

```typescript
import { ImagePickerComponent } from '@/src/components/ImagePicker';

function MyComponent() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <ImagePickerComponent
      onImageSelected={(uri, size) => {
        setImageUri(uri);
        console.log(`Image selected: ${size} bytes`);
      }}
      onError={(error) => {
        console.error('Image selection error:', error);
      }}
      compressionOptions={{
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        maxSizeInMB: 3,
      }}
    >
      {/* Optional: Custom trigger button */}
      <View style={styles.customButton}>
        <Text>Choose Photo</Text>
      </View>
    </ImagePickerComponent>
  );
}
```

### Using Avatar Component

```typescript
import { Avatar } from '@/src/components/Avatar';

// Simple avatar
<Avatar uri={user.avatar} name={user.name} size={50} />

// Custom styling
<Avatar
  uri={user.avatar}
  name="John Doe"
  size={80}
  borderColor="#10b981"
  borderWidth={3}
  style={{ marginRight: 12 }}
/>

// Without image (shows initials)
<Avatar name="Jane Smith" size={40} />
```

### Using Avatar Group

```typescript
import { AvatarGroup } from '@/src/components/Avatar';

<AvatarGroup
  items={[
    { uri: user1.avatar, name: user1.name },
    { uri: user2.avatar, name: user2.name },
    { uri: user3.avatar, name: user3.name },
    { uri: user4.avatar, name: user4.name },
    { uri: user5.avatar, name: user5.name },
  ]}
  size={40}
  maxCount={4}
  overlap={12}
/>
// Shows first 4 avatars + "+1" badge
```

### Using Image Utilities

```typescript
import {
  pickImageFromCamera,
  pickImageFromGallery,
  compressImage,
  prepareImageForUpload,
  formatFileSize,
} from '@/src/utils/imageUtils';

// Pick from camera
const image = await pickImageFromCamera();
if (image) {
  console.log('Image URI:', image.uri);
}

// Pick from gallery
const galleryImage = await pickImageFromGallery();

// Compress manually
const compressed = await compressImage(uri, {
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.7,
});

// Prepare for upload (compress + validate)
const { uri: readyUri, size } = await prepareImageForUpload(uri, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  maxSizeInMB: 5,
});

// Format size for display
console.log(formatFileSize(1024)); // "1 KB"
console.log(formatFileSize(1536000)); // "1.46 MB"
```

## 🎯 Configuration

### Compression Options

```typescript
interface CompressionOptions {
  maxWidth?: number; // Default: 1024
  maxHeight?: number; // Default: 1024
  quality?: number; // Default: 0.8 (0-1)
  maxSizeInMB?: number; // Default: 5
}
```

**Recommendations:**

- **Profile Avatars**: 500x500, quality 0.8, max 2MB
- **Team Logos**: 500x500, quality 0.8, max 2MB
- **Venue Images**: 1024x1024, quality 0.85, max 5MB
- **Match Photos**: 1024x1024, quality 0.8, max 5MB

### Avatar Colors

The avatar component uses 16 distinct colors:

- Red, Orange, Amber, Yellow
- Lime, Green, Teal, Cyan
- Sky, Blue, Indigo, Violet
- Purple, Fuchsia, Pink, Rose

Colors are consistently generated from names using a hash function.

## 🧪 Testing

### Test Image Selection

1. **On iOS Simulator**:
   - Camera: Not available (use gallery)
   - Gallery: Drag images into simulator

2. **On Android Emulator**:
   - Camera: Uses virtual camera
   - Gallery: Add images via device file browser

3. **On Physical Device**:
   - Both camera and gallery work normally
   - Test permission flows
   - Verify compression reduces file size

### Test Compression

```typescript
import { getImageSize, compressImage } from '@/src/utils/imageUtils';

const originalSize = await getImageSize(originalUri);
console.log('Original:', formatFileSize(originalSize));

const compressedUri = await compressImage(originalUri, {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
});

const compressedSize = await getImageSize(compressedUri);
console.log('Compressed:', formatFileSize(compressedSize));
console.log('Reduction:', Math.round((1 - compressedSize / originalSize) * 100) + '%');
```

### Test Avatar Fallbacks

```typescript
// Test with no image (should show initials)
<Avatar name="John Doe" size={50} />

// Test with empty name (should show "?")
<Avatar name="" size={50} />

// Test with single name (should show first letter)
<Avatar name="Madonna" size={50} />
```

## 📊 Status

- ✅ **Image Utilities**: Complete with compression and validation
- ✅ **Image Picker Component**: Complete with modal and error handling
- ✅ **Avatar Component**: Complete with fallbacks and groups
- ✅ **Profile Integration**: Complete with image selection
- ✅ **Team Integration**: Complete with logo selection
- ✅ **Permissions**: Complete iOS and Android configuration
- 🔜 **Backend Upload**: Requires backend implementation
- 🔜 **CDN Integration**: Requires cloud storage setup
- 🔜 **Testing**: Requires physical devices

## 💡 Future Enhancements

1. **Image Cropping**: Advanced crop tool before upload
2. **Filters**: Apply Instagram-style filters
3. **Multiple Images**: Support for galleries (venues, matches)
4. **Progress Indicator**: Show upload progress
5. **Image Caching**: Cache downloaded images locally
6. **Image Optimization**: WebP format support
7. **Background Upload**: Upload while app is backgrounded
8. **Image Metadata**: Include EXIF data cleaning
9. **OCR**: Extract text from images
10. **Image Recognition**: Auto-tag sports equipment

## 🐛 Troubleshooting

### Permission Denied

**Symptoms**: Alert shows "Permission Required"
**Solutions**:

- iOS: Settings > MiloKhelo > Photos/Camera
- Android: Settings > Apps > MiloKhelo > Permissions
- Reinstall app to reset permissions

### Image Too Large

**Symptoms**: Compression fails or upload times out
**Solutions**:

- Reduce maxWidth/maxHeight in compressionOptions
- Lower quality setting (0.6-0.7)
- Reduce maxSizeInMB threshold
- Try picking smaller images

### Compression Not Working

**Symptoms**: File size not reduced after compression
**Solutions**:

- Verify expo-image-manipulator is installed
- Check compression options are passed correctly
- Ensure original image is actually large
- Some formats compress better than others

### Avatar Not Showing

**Symptoms**: Blank avatar or missing image
**Solutions**:

- Check URI is valid and accessible
- Verify image exists at URI
- Check network connection (if remote URL)
- Use fallback: provide name for initials

### Modal Not Closing

**Symptoms**: Image picker modal stuck open
**Solutions**:

- Check onImageSelected callback is defined
- Ensure state updates trigger re-render
- Try canceling and re-opening
- Check for JavaScript errors in console

---

**Implementation Status**: ✅ **COMPLETE - Ready for Backend Integration**  
**Time Spent**: ~1 hour  
**Next Task**: OAuth UI or Backend Upload Implementation
