import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for thread safety
import matplotlib.pyplot as plt
import io
import base64
from scipy import ndimage

class NDVIProcessor:
    @staticmethod
    def calculate_ndvi(red, nir):
        """
        Calculate NDVI from red and near-infrared bands.
        
        Args:
            red (numpy.ndarray): Red band array
            nir (numpy.ndarray): Near-infrared band array
            
        Returns:
            numpy.ndarray: NDVI array with values clipped to [-1, 1]
        """
        # Handle division by zero by setting denominator to 1 where it would be zero
        denominator = nir + red
        denominator[denominator == 0] = 1
        
        # Calculate NDVI
        ndvi = (nir - red) / denominator
        
        # Clip values to [-1, 1] range
        ndvi = np.clip(ndvi, -1, 1)
        
        return ndvi
    
    @staticmethod
    def smooth_ndvi(ndvi):
        """
        Apply Gaussian smoothing to NDVI data.
        
        Args:
            ndvi (numpy.ndarray): NDVI array
            
        Returns:
            numpy.ndarray: Smoothed NDVI array
        """
        # Apply Gaussian filter with sigma=1
        smoothed = ndimage.gaussian_filter(ndvi, sigma=1)
        return smoothed
    
    @staticmethod
    def create_ndvi_visualization(ndvi):
        """
        Create a visualization of NDVI data using matplotlib.
        
        Args:
            ndvi (numpy.ndarray): NDVI array
            
        Returns:
            str: Base64 encoded PNG image
        """
        # Create figure
        plt.figure(figsize=(10, 8))
        ax = plt.gca()
        
        # Plot NDVI with RdYlGn colormap
        im = ax.imshow(ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
        plt.colorbar(im, ax=ax, label='NDVI')
        ax.set_title('Normalized Difference Vegetation Index (NDVI)')
        ax.set_xlabel('Pixel')
        ax.set_ylabel('Pixel')
        
        # Save to base64 string
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64
    
    @staticmethod
    def calculate_statistics(ndvi):
        """
        Calculate statistics for NDVI data.
        
        Args:
            ndvi (numpy.ndarray): NDVI array
            
        Returns:
            dict: Statistics including mean, median, std, min, max, p25, p75
        """
        # Flatten the array for percentile calculations
        flat_ndvi = ndvi.flatten()
        
        stats = {
            'mean': float(np.mean(ndvi)),
            'median': float(np.median(ndvi)),
            'std': float(np.std(ndvi)),
            'min': float(np.min(ndvi)),
            'max': float(np.max(ndvi)),
            'p25': float(np.percentile(flat_ndvi, 25)),
            'p75': float(np.percentile(flat_ndvi, 75))
        }
        
        return stats