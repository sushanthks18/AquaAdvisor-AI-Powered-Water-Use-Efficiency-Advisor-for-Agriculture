"""
NDVI and Stress Zone Visualization
Generates GeoJSON and visual representations
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from typing import Dict, List, Tuple

class NDVIVisualizer:
    """Generate visualizations for NDVI and stress zones"""
    
    @staticmethod
    def create_ndvi_heatmap(ndvi_field: np.ndarray) -> str:
        """
        Create NDVI heatmap visualization
        
        Args:
            ndvi_field: 100x100 NDVI array
            
        Returns:
            str: Base64 encoded PNG image
        """
        plt.figure(figsize=(10, 8))
        
        # Create heatmap with RdYlGn colormap
        im = plt.imshow(ndvi_field, cmap='RdYlGn', vmin=0, vmax=1, interpolation='bilinear')
        
        # Add colorbar
        cbar = plt.colorbar(im, label='NDVI Value')
        cbar.set_ticks([0, 0.2, 0.4, 0.6, 0.8, 1.0])
        cbar.set_ticklabels(['0.0\n(Bare)', '0.2\n(Sparse)', '0.4\n(Low)', 
                             '0.6\n(Moderate)', '0.8\n(Good)', '1.0\n(Dense)'])
        
        plt.title('NDVI Vegetation Health Map', fontsize=14, fontweight='bold')
        plt.xlabel('Distance (West → East)', fontsize=10)
        plt.ylabel('Distance (South → North)', fontsize=10)
        
        # Remove tick labels
        plt.xticks([])
        plt.yticks([])
        
        # Add statistics annotation
        stats_text = f'Mean: {np.mean(ndvi_field):.3f}\n'
        stats_text += f'Min: {np.min(ndvi_field):.3f}\n'
        stats_text += f'Max: {np.max(ndvi_field):.3f}'
        plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes,
                fontsize=9, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_stress_zone_map(zones: np.ndarray, stats: Dict) -> str:
        """
        Create stress zone visualization
        
        Args:
            zones: Classification array (0=critical, 1=high, 2=moderate, 3=healthy)
            stats: Zone statistics
            
        Returns:
            str: Base64 encoded PNG image
        """
        plt.figure(figsize=(10, 8))
        
        # Define colors
        colors = np.array([
            [220/255, 38/255, 38/255],   # Critical - Red
            [245/255, 158/255, 11/255],  # High - Orange
            [252/255, 211/255, 77/255],  # Moderate - Yellow
            [16/255, 185/255, 129/255]   # Healthy - Green
        ])
        
        # Create RGB image
        rgb_image = colors[zones]
        
        # Display
        plt.imshow(rgb_image, interpolation='nearest')
        
        plt.title('Water Stress Zone Map', fontsize=14, fontweight='bold')
        plt.xlabel('Distance (West → East)', fontsize=10)
        plt.ylabel('Distance (South → North)', fontsize=10)
        
        # Remove ticks
        plt.xticks([])
        plt.yticks([])
        
        # Create legend with statistics
        import matplotlib.patches as mpatches
        legend_elements = [
            mpatches.Patch(facecolor='#DC2626', edgecolor='black', 
                          label=f'🔴 Critical: {stats["critical"]["percentage"]:.1f}%'),
            mpatches.Patch(facecolor='#F59E0B', edgecolor='black',
                          label=f'🟠 High: {stats["high"]["percentage"]:.1f}%'),
            mpatches.Patch(facecolor='#FCD34D', edgecolor='black',
                          label=f'🟡 Moderate: {stats["moderate"]["percentage"]:.1f}%'),
            mpatches.Patch(facecolor='#10B981', edgecolor='black',
                          label=f'🟢 Healthy: {stats["healthy"]["percentage"]:.1f}%')
        ]
        
        plt.legend(handles=legend_elements, loc='upper right', fontsize=9,
                  framealpha=0.9, edgecolor='black')
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_trend_chart(time_series: List[Dict]) -> str:
        """
        Create NDVI trend chart
        
        Args:
            time_series: List of {date, ndvi, precipitation}
            
        Returns:
            str: Base64 encoded PNG image
        """
        plt.figure(figsize=(12, 6))
        
        # Extract data
        dates = [item['date'] for item in time_series]
        ndvi_values = [item['ndvi'] for item in time_series]
        precip_values = [item.get('precipitation', 0) for item in time_series]
        
        # Format dates for display (show every 5th date)
        date_labels = []
        for i, d in enumerate(dates):
            if i % 5 == 0:
                # Convert YYYYMMDD to MMM DD
                from datetime import datetime
                dt = datetime.strptime(d, '%Y%m%d')
                date_labels.append(dt.strftime('%b %d'))
            else:
                date_labels.append('')
        
        # Create dual-axis plot
        fig, ax1 = plt.subplots(figsize=(12, 6))
        
        # NDVI line
        color = 'tab:green'
        ax1.set_xlabel('Date', fontsize=11)
        ax1.set_ylabel('NDVI', color=color, fontsize=11)
        ax1.plot(range(len(dates)), ndvi_values, color=color, linewidth=2, marker='o', markersize=4)
        ax1.tick_params(axis='y', labelcolor=color)
        ax1.set_ylim([0, 1.0])
        ax1.grid(True, alpha=0.3)
        ax1.set_xticks(range(len(dates)))
        ax1.set_xticklabels(date_labels, rotation=45, ha='right')
        
        # Precipitation bars
        ax2 = ax1.twinx()
        color = 'tab:blue'
        ax2.set_ylabel('Precipitation (mm)', color=color, fontsize=11)
        ax2.bar(range(len(dates)), precip_values, color=color, alpha=0.3, width=0.8)
        ax2.tick_params(axis='y', labelcolor=color)
        
        # Add trend line
        if len(ndvi_values) > 5:
            z = np.polyfit(range(len(ndvi_values)), ndvi_values, 1)
            p = np.poly1d(z)
            ax1.plot(range(len(dates)), p(range(len(dates))), 
                    "r--", alpha=0.5, linewidth=1, label='Trend')
        
        plt.title('Vegetation Health Trend (30 Days)', fontsize=14, fontweight='bold')
        fig.tight_layout()
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64
    
    @staticmethod
    def generate_geojson(boundary_coords: List, ndvi_field: np.ndarray, zones: np.ndarray) -> Dict:
        """
        Generate GeoJSON representation of NDVI data
        
        Args:
            boundary_coords: Farm boundary coordinates
            ndvi_field: NDVI array
            zones: Stress zones array
            
        Returns:
            dict: GeoJSON FeatureCollection
        """
        # For simplicity, create a grid overlay
        # In production, you'd use actual raster-to-vector conversion
        
        features = []
        
        # Add boundary
        features.append({
            "type": "Feature",
            "properties": {
                "name": "Farm Boundary",
                "type": "boundary"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [boundary_coords]
            }
        })
        
        # Add zone summary as point features (simplified)
        if len(boundary_coords) > 0:
            # Calculate center
            lats = [coord[0] for coord in boundary_coords]
            lons = [coord[1] for coord in boundary_coords]
            center_lat = sum(lats) / len(lats)
            center_lon = sum(lons) / len(lons)
            
            # Add markers for different stress zones
            zone_names = ['Critical', 'High', 'Moderate', 'Healthy']
            zone_colors = ['#DC2626', '#F59E0B', '#FCD34D', '#10B981']
            
            for i, name in enumerate(zone_names):
                zone_pixels = np.sum(zones == i)
                if zone_pixels > 0:
                    features.append({
                        "type": "Feature",
                        "properties": {
                            "name": f"{name} Stress Zone",
                            "type": "stress_zone",
                            "level": i,
                            "color": zone_colors[i],
                            "percentage": float(zone_pixels / zones.size * 100),
                            "mean_ndvi": float(np.mean(ndvi_field[zones == i]))
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [center_lon + (i - 1.5) * 0.001, center_lat]
                        }
                    })
        
        return {
            "type": "FeatureCollection",
            "features": features
        }
