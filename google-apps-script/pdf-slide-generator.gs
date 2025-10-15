// 🚀 Google Apps Script - V4.4: Complete Script with Play Button Feature

// CONFIGURATION
const TEMPLATE_PRESENTATION_ID = '1eRF7HiCvh4rQygx8PfrkIl94jDzW279BNStqypSSQ8E';
const INTRO_IMAGE_ID = '1wMIJMgc8JUKf33WY6UuqJKv0tnW-dhE4';
const OUTRO_IMAGE_ID = '1lgerUkU8QQsMKGvwSwaewh4vjA4mC5Qb';

// Play button configuration - using direct URL for reliability
const PLAY_BUTTON_URL = 'https://drive.google.com/file/d/1mUDps813tPQO_A3WjGMZKVIzKUAu6oOE/view?usp=sharing';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const payload = data.payload || data;
    const result = generateSlides(payload);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function generateSlides(data) {
  try {
    const templatePresentation = SlidesApp.openById(TEMPLATE_PRESENTATION_ID);
    const newPresentation = SlidesApp.create(data.fileName || 'Generated Plan');
    newPresentation.getSlides()[0].remove();

    addStaticSlide(newPresentation, INTRO_IMAGE_ID);
    addTitleSlide(newPresentation, templatePresentation, data);

    // Process the main chronological posts first
    if (data.mainPosts && data.mainPosts.length > 0) {
      console.log(`Processing ${data.mainPosts.length} main posts chronologically.`);
      data.mainPosts.forEach((slideData, index) => {
        addContentSlide(newPresentation, templatePresentation, slideData, index + 1);
      });
    }

    // Process the grouped stories at the end
    if (data.storyPosts && data.storyPosts.length > 0) {
      console.log(`Processing ${data.storyPosts.length} stories with grouping logic.`);
      addStoriesSlides(newPresentation, templatePresentation, data.storyPosts);
    }

    addStaticSlide(newPresentation, OUTRO_IMAGE_ID);
    
    Utilities.sleep(5000);
    DriveApp.getFileById(newPresentation.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      success: true,
      presentationUrl: `https://docs.google.com/presentation/d/${newPresentation.getId()}/edit`,
      pdfExportUrl: `https://docs.google.com/presentation/d/${newPresentation.getId()}/export/pdf`,
      slidesCount: newPresentation.getSlides().length,
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ======================================================================================
// == CONTENT SLIDE CREATION WITH PLAY BUTTON SUPPORT
// ======================================================================================
function addContentSlide(presentation, templatePresentation, slideData, slideNumber) {
  console.log(`🎬 Processing slide ${slideNumber}: ${slideData.type}`);
  
  let templateIndex;
  let title;

  // Determine template and title based on post type
  if (slideData.type === 'REELS') {
    templateIndex = 2;
    title = `REELS ${slideNumber}`;
    console.log(`🎥 REELS detected - will add play button`);
  } else if (slideData.type === 'CAROUSEL') {
    const imageCount = slideData.images ? Math.min(slideData.images.length, 10) : 0;
    templateIndex = imageCount >= 2 ? (6 + imageCount) : 1;
    title = `GÖNDERİ ${slideNumber}`;
  } else { // FEED
    templateIndex = 1;
    title = `GÖNDERİ ${slideNumber}`;
  }
  
  const templateSlide = templatePresentation.getSlides()[templateIndex];
  const newSlide = presentation.appendSlide(templateSlide);

  replaceText(newSlide, {
    '{{TITLE}}': title,
    '{{CONTENT}}': slideData.content || '',
    '{{PUBLISH_DATE}}': slideData.publishDate || '',
  });

  if (slideData.type === 'CAROUSEL' && slideData.images) {
    replaceCarouselImages(newSlide, slideData.images, slideData.medyaUrl, slideData.isVideo);
  } else if (slideData.imageUrl) {
    // For REELS, always show play button. For others, check isVideo flag
    const shouldShowPlayButton = slideData.type === 'REELS' || slideData.isVideo;
    console.log(`🎯 Processing single image. shouldShowPlayButton: ${shouldShowPlayButton}`);
    replaceSingleImage(newSlide, slideData.imageUrl, slideData.medyaUrl, shouldShowPlayButton);
  }
}

// ======================================================================================
// == ENHANCED PLAY BUTTON OVERLAY FUNCTION - Replace the old one with this
// ======================================================================================
function addPlayButtonOverlay(slide, targetImage) {
  try {
    console.log('🎥 Adding play button overlay with background...');
    
    // Validate parameters
    if (!slide) {
      throw new Error('Slide parameter is null or undefined');
    }
    if (!targetImage) {
      throw new Error('Target image parameter is null or undefined');
    }
    
    // Get target image properties
    const imageLeft = targetImage.getLeft();
    const imageTop = targetImage.getTop();
    const imageWidth = targetImage.getWidth();
    const imageHeight = targetImage.getHeight();
    
    console.log(`📐 Target image: ${Math.round(imageWidth)}x${Math.round(imageHeight)} at (${Math.round(imageLeft)}, ${Math.round(imageTop)})`);
    
    // Create background circle first (larger and more visible)
    const circleSize = Math.max(Math.min(imageWidth * 0.25, 100), 40);
    const circleLeft = imageLeft + (imageWidth - circleSize) / 2;
    const circleTop = imageTop + (imageHeight - circleSize) / 2;
    
    // Add semi-transparent dark circle background
    const backgroundCircle = slide.insertShape(SlidesApp.ShapeType.ELLIPSE);
    backgroundCircle.setLeft(circleLeft);
    backgroundCircle.setTop(circleTop);
    backgroundCircle.setWidth(circleSize);
    backgroundCircle.setHeight(circleSize);
    
    // Style the background circle with dark semi-transparent fill
    const fill = backgroundCircle.getFill();
    fill.setSolidFill('#000000');
    backgroundCircle.getImageProperties().setTransparency(0.3); // 70% opaque black circle
    
    // Remove border from circle
    const line = backgroundCircle.getLine();
    line.setTransparent();
    
    console.log('⚫ Background circle added');
    
    // Now add the white play button icon on top of the circle
    const playButton = slide.insertImage(PLAY_BUTTON_URL);
    
    if (!playButton) {
      throw new Error('Failed to insert play button image');
    }
    
    // Size the play button (60% of circle size)
    const playButtonSize = circleSize * 0.6;
    const playButtonLeft = circleLeft + (circleSize - playButtonSize) / 2;
    const playButtonTop = circleTop + (circleSize - playButtonSize) / 2;
    
    playButton.setWidth(playButtonSize);
    playButton.setHeight(playButtonSize);
    playButton.setLeft(playButtonLeft);
    playButton.setTop(playButtonTop);
    
    // Make play button fully opaque (no transparency)
    playButton.getImageProperties().setTransparency(0);
    
    // Bring both elements to the front to ensure visibility
    backgroundCircle.bringToFront();
    playButton.bringToFront();
    
    console.log(`✅ Play button with dark background positioned at (${Math.round(playButtonLeft)}, ${Math.round(playButtonTop)})`);
    console.log(`📏 Circle size: ${Math.round(circleSize)}, Play button size: ${Math.round(playButtonSize)}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Failed to add play button overlay: ${error.toString()}`);
    return false;
  }
}

// ======================================================================================
// == SINGLE IMAGE REPLACEMENT WITH PLAY BUTTON SUPPORT
// ======================================================================================
function replaceSingleImage(slide, imageUrl, linkUrl, isVideo = false) {
  console.log(`🖼️ replaceSingleImage called with isVideo: ${isVideo}`);
  
  const shapes = slide.getShapes();
  let imageReplaced = false;
  
  shapes.forEach((shape, index) => {
    if (imageReplaced) return;
    
    try {
      if (shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE) {
        const hexColor = shape.getFill().getSolidFill().getColor().asRgbColor().asHexString().toLowerCase();
        
        if (hexColor === '#f8f8f8' || hexColor === '#e0e0e0') {
          console.log(`✅ Found placeholder rectangle`);
          
          const container = { l: shape.getLeft(), t: shape.getTop(), w: shape.getWidth(), h: shape.getHeight() };
          const newImage = slide.insertImage(imageUrl);
          
          Utilities.sleep(2000);
          
          const img = { w: newImage.getWidth(), h: newImage.getHeight() };
          const scale = Math.min(container.w / img.w, container.h / img.h);
          newImage.setWidth(img.w * scale).setHeight(img.h * scale);
          newImage.setLeft(container.l + (container.w - newImage.getWidth()) / 2);
          newImage.setTop(container.t + (container.h - newImage.getHeight()) / 2);
          
          if (linkUrl) {
            newImage.setLinkUrl(linkUrl);
          }
          
          // Add play button overlay for video content
          if (isVideo) {
            console.log(`🎥 Adding play button overlay for video content...`);
            Utilities.sleep(1000); // Give image time to settle
            addPlayButtonOverlay(slide, newImage);
          } else {
            console.log(`ℹ️ Skipping play button (not a video)`);
          }
          
          shape.remove();
          imageReplaced = true;
          console.log(`✅ Image replacement completed`);
        }
      }
    } catch (e) {
      console.log(`❌ Error processing shape ${index}: ${e.toString()}`);
    }
  });
}

// ======================================================================================
// == CAROUSEL IMAGES WITH PLAY BUTTON SUPPORT
// ======================================================================================
function replaceCarouselImages(slide, imageUrls, linkUrl, isVideo = false) {
  const shapes = slide.getShapes();
  const placeholders = [];
  
  shapes.forEach(shape => {
    try {
      if (shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE) {
         const hexColor = shape.getFill().getSolidFill().getColor().asRgbColor().asHexString().toLowerCase();
         if (hexColor === '#f8f8f8' || hexColor === '#e0e0e0') {
           placeholders.push(shape);
         }
      }
    } catch (e) {}
  });
  
  placeholders.forEach((placeholder, index) => {
    if (index < imageUrls.length) {
       const newImage = slide.insertImage(imageUrls[index]);
       Utilities.sleep(1500);
       
       const container = { l: placeholder.getLeft(), t: placeholder.getTop(), w: placeholder.getWidth(), h: placeholder.getHeight() };
       const img = { w: newImage.getWidth(), h: newImage.getHeight() };
       const scale = Math.min(container.w / img.w, container.h / img.h);
       newImage.setWidth(img.w * scale).setHeight(img.h * scale);
       newImage.setLeft(container.l + (container.w - newImage.getWidth()) / 2);
       newImage.setTop(container.t + (container.h - newImage.getHeight()) / 2);
       
       if (index === 0 && linkUrl) newImage.setLinkUrl(linkUrl);
       
       // Add play button overlay for video content (on first image)
       if (isVideo && index === 0) {
         console.log(`🎥 Adding play button to carousel video...`);
         Utilities.sleep(1000);
         addPlayButtonOverlay(slide, newImage);
       }
       
       placeholder.remove();
    }
  });
}

// ======================================================================================
// == STORY SLIDES WITH PLAY BUTTON SUPPORT
// ======================================================================================
function addStoriesSlides(presentation, templatePresentation, stories) {
  function distributeStories(totalStories) {
    const distributions = { 1:[2], 2:[2], 3:[3], 4:[4], 5:[5], 6:[3,3], 7:[4,3], 8:[4,4], 9:[5,4], 10:[5,5] };
    if (distributions[totalStories]) return distributions[totalStories];
    const result = [];
    let remaining = totalStories;
    while(remaining > 0) {
      const num = Math.min(remaining, 5);
      result.push(num);
      remaining -= num;
    }
    return result;
  }

  const distribution = distributeStories(stories.length);
  let storyIndex = 0;
  
  distribution.forEach((storiesInSlide, slideIndex) => {
    const templateIndex = storiesInSlide < 2 ? 3 : storiesInSlide + 1;
    const templateSlide = templatePresentation.getSlides()[templateIndex];
    const newSlide = presentation.appendSlide(templateSlide);
    const slideStories = stories.slice(storyIndex, storyIndex + storiesInSlide);
    storyIndex += storiesInSlide;
    const title = distribution.length > 1 ? `HIKAYELER ${slideIndex + 1}` : 'HIKAYELER';
    replaceText(newSlide, { '{{TITLE}}': title });
    replaceStoryImages(newSlide, slideStories);
  });
}

function replaceStoryImages(slide, storyImages) {
  const shapes = slide.getShapes();
  const placeholders = [];
  
  shapes.forEach(shape => {
    try {
      if (shape.getShapeType() === SlidesApp.ShapeType.RECTANGLE) {
         const hexColor = shape.getFill().getSolidFill().getColor().asRgbColor().asHexString().toLowerCase();
         if (hexColor === '#f8f8f8' || hexColor === '#e0e0e0') {
           placeholders.push(shape);
         }
      }
    } catch (e) {}
  });

  placeholders.forEach((placeholder, index) => {
    if (index < storyImages.length) {
      const storyData = storyImages[index];
      const newImage = slide.insertImage(storyData.imageUrl);
      Utilities.sleep(1500);
      
      const container = { l: placeholder.getLeft(), t: placeholder.getTop(), w: placeholder.getWidth(), h: placeholder.getHeight() };
      const img = { w: newImage.getWidth(), h: newImage.getHeight() };
      const scale = Math.min(container.w / img.w, container.h / img.h);
      newImage.setWidth(img.w * scale).setHeight(img.h * scale);
      newImage.setLeft(container.l + (container.w - newImage.getWidth()) / 2);
      newImage.setTop(container.t + (container.h - newImage.getHeight()) / 2);
      
      if (storyData.medyaUrl) newImage.setLinkUrl(storyData.medyaUrl);
      
      // Add play button overlay for video stories
      if (storyData.isVideo) {
        console.log(`🎥 Adding play button to video story...`);
        Utilities.sleep(1000);
        addPlayButtonOverlay(slide, newImage);
      }
      
      placeholder.remove();
    }
  });
}

// ======================================================================================
// == HELPER FUNCTIONS (UNCHANGED)
// ======================================================================================
function addStaticSlide(presentation, imageId) {
  const slide = presentation.appendSlide();
  const imageFile = DriveApp.getFileById(imageId);
  const image = slide.insertImage(imageFile.getBlob());
  image.setWidth(presentation.getPageWidth()).setHeight(presentation.getPageHeight()).setLeft(0).setTop(0);
}

function addTitleSlide(presentation, templatePresentation, data) {
  const templateSlide = templatePresentation.getSlides()[0];
  const newSlide = presentation.appendSlide(templateSlide);
  replaceText(newSlide, {
    '{{BUSINESS_NAME}}': data.businessName || '',
    '{{MONTH}}': data.month || ''
  });
}

function replaceText(slide, replacements) {
  slide.getShapes().forEach(shape => {
    try {
      if (shape.getText) {
        let textRange = shape.getText();
        Object.keys(replacements).forEach(placeholder => {
          textRange.replaceAllText(placeholder, replacements[placeholder]);
        });
      }
    } catch (e) {}
  });
}