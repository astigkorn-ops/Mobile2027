import piexif from 'piexifjs';

interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

interface ExifData {
  coordinates?: GeoCoordinates;
  timestamp?: Date;
  deviceMake?: string;
  deviceModel?: string;
  software?: string;
  imageDescription?: string;
}

// Convert decimal degrees to DMS format
function toDegreesMinutesSeconds(coordinate: number): [[number, number], [number, number], [number, number]] {
  const degrees = Math.floor(Math.abs(coordinate));
  const minutes = Math.floor((Math.abs(coordinate) - degrees) * 60);
  const seconds = ((Math.abs(coordinate) - degrees) * 60 - minutes) * 60;

  return [
    [degrees, 1],
    [minutes, 1],
    [Math.round(seconds * 100), 100]
  ];
}

// Convert latitude to EXIF format
function latitudeToExif(latitude: number): { value: [[number, number], [number, number], [number, number]]; ref: string } {
  return {
    value: toDegreesMinutesSeconds(latitude),
    ref: latitude >= 0 ? 'N' : 'S'
  };
}

// Convert longitude to EXIF format
function longitudeToExif(longitude: number): { value: [[number, number], [number, number], [number, number]]; ref: string } {
  return {
    value: toDegreesMinutesSeconds(longitude),
    ref: longitude >= 0 ? 'E' : 'W'
  };
}

// Format date as EXIF timestamp
function formatExifDate(date: Date): string {
  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

// Embed EXIF data into JPEG image
export function embedExifData(imageDataUrl: string, exifData: ExifData): string {
  try {
    // Load existing EXIF data
    const exifObj = piexif.load(imageDataUrl);

    // GPS data
    if (exifData.coordinates) {
      const { latitude, longitude, altitude } = exifData.coordinates;

      // Latitude
      const latExif = latitudeToExif(latitude);
      exifObj.GPS[piexif.GPSIFD.GPSLatitude] = latExif.value;
      exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef] = latExif.ref;

      // Longitude
      const lonExif = longitudeToExif(longitude);
      exifObj.GPS[piexif.GPSIFD.GPSLongitude] = lonExif.value;
      exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef] = lonExif.ref;

      // Altitude (if available)
      if (altitude !== undefined) {
        exifObj.GPS[piexif.GPSIFD.GPSAltitude] = [[Math.round(altitude * 100), 100], [0, 1]];
        exifObj.GPS[piexif.GPSIFD.GPSAltitudeRef] = 0; // Above sea level
      }

      // GPS timestamp
      if (exifData.timestamp) {
        const time = exifData.timestamp;
        exifObj.GPS[piexif.GPSIFD.GPSTimeStamp] = [
          [time.getUTCHours(), 1],
          [time.getUTCMinutes(), 1],
          [time.getUTCSeconds(), 1]
        ];
        exifObj.GPS[piexif.GPSIFD.GPSDateStamp] = formatExifDate(time).split(' ')[0].replace(/-/g, ':');
      }
    }

    // EXIF data
    if (exifData.timestamp) {
      exifObj.Exif[piexif.ExifIFD.DateTimeOriginal] = formatExifDate(exifData.timestamp);
      exifObj.Exif[piexif.ExifIFD.DateTimeDigitized] = formatExifDate(exifData.timestamp);
    }

    if (exifData.deviceMake) {
      exifObj['0th'][piexif.ImageIFD.Make] = exifData.deviceMake;
    }

    if (exifData.deviceModel) {
      exifObj['0th'][piexif.ImageIFD.Model] = exifData.deviceModel;
    }

    if (exifData.software) {
      exifObj['0th'][piexif.ImageIFD.Software] = exifData.software;
    }

    if (exifData.imageDescription) {
      exifObj['0th'][piexif.ImageIFD.ImageDescription] = exifData.imageDescription;
    }

    // Dump EXIF data and insert into image
    const exifBytes = piexif.dump(exifObj);
    return piexif.insert(exifBytes, imageDataUrl);
  } catch (error) {
    console.error('Error embedding EXIF data:', error);
    return imageDataUrl; // Return original if embedding fails
  }
}

// Read EXIF data from image
export function readExifData(imageDataUrl: string): ExifData | null {
  try {
    const exifObj = piexif.load(imageDataUrl);

    const exifData: ExifData = {};

    // GPS data
    if (exifObj.GPS && exifObj.GPS[piexif.GPSIFD.GPSLatitude]) {
      const lat = exifObj.GPS[piexif.GPSIFD.GPSLatitude];
      const latRef = exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef];
      const lon = exifObj.GPS[piexif.GPSIFD.GPSLongitude];
      const lonRef = exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef];

      if (lat && lon) {
        const latitude = (lat[0][0] / lat[0][1]) + (lat[1][0] / lat[1][1] / 60) + (lat[2][0] / lat[2][1] / 3600);
        const longitude = (lon[0][0] / lon[0][1]) + (lon[1][0] / lon[1][1] / 60) + (lon[2][0] / lon[2][1] / 3600);

        exifData.coordinates = {
          latitude: latRef === 'S' ? -latitude : latitude,
          longitude: lonRef === 'W' ? -longitude : longitude,
        };

        // Altitude
        if (exifObj.GPS[piexif.GPSIFD.GPSAltitude]) {
          const alt = exifObj.GPS[piexif.GPSIFD.GPSAltitude];
          exifData.coordinates.altitude = alt[0][0] / alt[0][1];
        }
      }
    }

    // Timestamp
    if (exifObj.Exif && exifObj.Exif[piexif.ExifIFD.DateTimeOriginal]) {
      exifData.timestamp = new Date(exifObj.Exif[piexif.ExifIFD.DateTimeOriginal]);
    }

    // Device info
    if (exifObj['0th']) {
      exifData.deviceMake = exifObj['0th'][piexif.ImageIFD.Make];
      exifData.deviceModel = exifObj['0th'][piexif.ImageIFD.Model];
      exifData.software = exifObj['0th'][piexif.ImageIFD.Software];
      exifData.imageDescription = exifObj['0th'][piexif.ImageIFD.ImageDescription];
    }

    return exifData;
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return null;
  }
}

// Remove EXIF data from image
export function removeExifData(imageDataUrl: string): string {
  try {
    return piexif.remove(imageDataUrl);
  } catch (error) {
    console.error('Error removing EXIF data:', error);
    return imageDataUrl;
  }
}