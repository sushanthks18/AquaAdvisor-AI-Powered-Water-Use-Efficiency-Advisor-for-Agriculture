# User Manual

## Introduction
AquaAdvisor is an AI-powered tool that helps farmers optimize their irrigation practices by analyzing satellite imagery to detect water stress in crops. This manual will guide you through using the application to improve water efficiency and crop yields.

## Getting Started
1. Open your web browser and navigate to the AquaAdvisor application
2. Click "Get Started" on the landing page to begin field analysis
3. You'll be taken to the field selection page where you can either:
   - Draw your field boundaries on the map
   - Use the sample field for demonstration purposes

## Step-by-Step Guide

### 1. Select Your Field
- Use the drawing tools on the map to outline your field boundaries
- Click on the map to create vertices of your field polygon
- Double-click on the first point to close the polygon
- Alternatively, click "Use Sample Field" to try with a predefined area

### 2. Analyze Your Field
Choose between two analysis options:
- **Quick Analysis**: Faster processing with limited results
- **Full Analysis**: Comprehensive analysis with detailed recommendations

Click the appropriate button to start the analysis. The system will process satellite imagery and generate insights.

### 3. Review Results
Once analysis is complete, you'll be presented with a dashboard containing:

#### Overview Cards
- **Health Score**: Overall health of your field (0-100%)
- **Mean NDVI**: Average vegetation health index
- **Field Area**: Size of your field in hectares
- **Water Deficit**: Estimated water deficit in millimeters

#### Visualizations
- **NDVI Map**: Color-coded visualization of vegetation health
- **Stress Zone Map**: Classification of areas by water stress level

#### Zone Distribution
Breakdown of your field by stress levels:
- **Critical**: Severe water stress (red)
- **High**: Significant water stress (orange)
- **Moderate**: Some water stress (yellow)
- **Healthy**: Optimal water conditions (green)

#### Quadrant Analysis
Analysis of your field divided into four quadrants (NW, NE, SW, SE) showing mean NDVI and percentage of stressed areas.

#### Weather Summary
Current weather conditions that affect irrigation needs:
- Temperature
- Humidity
- Weather description

### 4. Act on Recommendations
The recommendations section provides prioritized advice for irrigation management:
- **Priority**: Order of importance (1 = highest)
- **Urgency**: Critical, High, Moderate, Maintenance, or Info
- **Zone**: Affected area of your field
- **Action**: Recommended action
- **Reason**: Why this action is needed
- **Water Amount**: How much additional water is needed
- **Timing**: When to implement the recommendation
- **Cost Impact**: Estimated cost impact

## Understanding the Science

### NDVI (Normalized Difference Vegetation Index)
NDVI measures vegetation health by comparing near-infrared and red light reflectance:
- Values range from -1 to 1
- Higher values indicate healthier vegetation
- Lower values indicate water stress or bare soil

### Stress Zone Classification
The application classifies your field into four stress zones:
1. **Critical (Red)**: NDVI < 0.3 - Immediate irrigation needed
2. **High (Orange)**: 0.3 ≤ NDVI < 0.5 - Significant stress, irrigation needed
3. **Moderate (Yellow)**: 0.5 ≤ NDVI < 0.6 - Some stress, monitor conditions
4. **Healthy (Green)**: NDVI ≥ 0.6 - Optimal conditions

### Water Deficit Calculation
Water deficit is calculated as the difference between:
- **ET0 (Reference Evapotranspiration)**: Water lost through evaporation and plant transpiration
- **Rainfall**: Recent and forecasted precipitation

## Best Practices

### For Accurate Results
1. Draw field boundaries as accurately as possible
2. Perform analysis during mid-morning for best satellite imagery
3. Avoid analysis during heavy cloud cover
4. Regular monitoring (weekly) provides the best irrigation management

### Interpreting Results
1. Focus on Critical and High stress zones first
2. Consider weather forecasts when planning irrigation
3. Track changes over time to identify trends
4. Compare quadrant analysis to identify irrigation system issues

### Implementing Recommendations
1. Follow priority order when implementing recommendations
2. Adjust irrigation timing based on weather forecasts
3. Monitor results after implementing changes
4. Re-analyze fields regularly to track improvements

## Interpreting Results

### Health Score
- **80-100%**: Excellent field health
- **60-79%**: Good field health with minor concerns
- **40-59%**: Fair field health, some stress areas
- **Below 40%**: Poor field health, significant stress

### Water Savings
The application estimates potential water savings:
- Percentage of water that can be saved
- Millimeters of water saved per season
- Progress bar showing current efficiency

### Zone Distribution
- High Critical or High stress percentages indicate need for immediate action
- Uneven distribution across zones may indicate irrigation system issues
- Increasing Healthy zone percentage shows improving conditions

## FAQs

### Q: Do I need special equipment to use AquaAdvisor?
A: No, AquaAdvisor works entirely with satellite imagery. No hardware installation is required in your fields.

### Q: How often should I analyze my fields?
A: For best results, analyze fields weekly during the growing season. More frequent analysis may be needed during stress conditions.

### Q: What if it's cloudy in my area?
A: Cloud cover can affect satellite imagery quality. The system uses cloud-free images when available, but results may be limited during extended cloudy periods.

### Q: How accurate are the recommendations?
A: Recommendations are based on scientific analysis of vegetation indices and weather data. However, local conditions and field-specific factors should also be considered.

### Q: Can I use AquaAdvisor for all crop types?
A: The application works for most crops that show distinct vegetation signatures. However, some specialty crops may require different analysis approaches.

### Q: Is my field data stored or shared?
A: Field boundary data is processed temporarily for analysis and not stored or shared with third parties.

## Glossary

- **NDVI**: Normalized Difference Vegetation Index - measures vegetation health
- **ET0**: Reference Evapotranspiration - water lost through evaporation and plant transpiration
- **Sentinel-2**: European Space Agency satellite providing high-resolution imagery
- **Water Stress**: Condition where plants receive insufficient water for optimal growth
- **Base64**: Encoding method used to represent binary data in ASCII format
- **API**: Application Programming Interface - allows communication between software components
- **Revisit Cycle**: Time interval between satellite passes over the same area
- **Spatial Resolution**: Level of detail in satellite imagery, measured in meters

For technical support, please contact our support team at support@aquaadvisor.com.