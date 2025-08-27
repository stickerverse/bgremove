const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const uploadBtn = document.getElementById("uploadBtn");
const statusDiv = document.getElementById("status");

// Slider elements
const sliderSection = document.getElementById("sliderSection");
const sliderBefore = document.getElementById("sliderBefore");
const sliderAfter = document.getElementById("sliderAfter");
const sliderDivider = document.getElementById("sliderDivider");

// Initialize status display
if (!statusDiv) {
    const div = document.createElement("div");
    div.id = "status";
    div.style.marginTop = "10px";
    div.style.padding = "10px";
    div.style.borderRadius = "5px";
    div.style.display = "none";
    document.querySelector(".container").appendChild(div);
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        result.src = ""; // Clear previous result
        hideStatus();
        hideSlider(); // Hide slider when new image is selected
    }
});

async function uploadImage() {
    const file = fileInput.files[0];
    if (!file) {
        showStatus("Please choose an image first!", "error");
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
        showStatus("Please select a valid image file!", "error");
        return;
    }
    
    // Show loading state
    showStatus("Processing image... Please wait.", "loading");
    uploadBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("http://localhost:8000/remove-bg/", {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const blob = await response.blob();
        result.src = URL.createObjectURL(blob);
        
        // Show the before/after slider
        showSlider();
        
        showStatus("Background removed successfully!", "success");
        
    } catch (error) {
        console.error("Error:", error);
        if (error.message.includes("Failed to fetch")) {
            showStatus("Cannot connect to server. Please make sure the backend is running on port 8000.", "error");
        } else {
            showStatus(`Error: ${error.message}`, "error");
        }
    } finally {
        uploadBtn.disabled = false;
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById("status");
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    
    // Set color based on type
    switch (type) {
        case "success":
            statusDiv.style.backgroundColor = "#d4edda";
            statusDiv.style.color = "#155724";
            statusDiv.style.border = "1px solid #c3e6cb";
            break;
        case "error":
            statusDiv.style.backgroundColor = "#f8d7da";
            statusDiv.style.color = "#721c24";
            statusDiv.style.border = "1px solid #f5c6cb";
            break;
        case "loading":
            statusDiv.style.backgroundColor = "#d1ecf1";
            statusDiv.style.color = "#0c5460";
            statusDiv.style.border = "1px solid #bee5eb";
            break;
    }
}

function hideStatus() {
    const statusDiv = document.getElementById("status");
    statusDiv.style.display = "none";
}

function showSlider() {
    console.log("Showing slider...");
    
    // Set the slider images
    sliderBefore.src = preview.src;
    sliderAfter.src = result.src;
    
    // Show the slider section
    sliderSection.style.display = "block";
    
    // Initialize slider position
    updateSliderPosition(50);
    
    console.log("Slider shown successfully");
}

function hideSlider() {
    sliderSection.style.display = "none";
}

function updateSliderPosition(percentage) {
    // Clamp percentage between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    
    console.log(`Updating slider position to ${percentage}%`);
    
    // Update divider position
    sliderDivider.style.left = percentage + "%";
    
    // Update the clip-path of the after image
    sliderAfter.style.clipPath = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
}

// Slider drag functionality
let isDragging = false;
let startX = 0;
let startPercentage = 50;

// Initialize slider when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing slider...");
    
    if (sliderDivider) {
        // Mouse events
        sliderDivider.addEventListener("mousedown", startDrag);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);
        
        // Touch events
        sliderDivider.addEventListener("touchstart", startDragTouch);
        document.addEventListener("touchmove", dragTouch);
        document.addEventListener("touchend", stopDrag);
        
        // Click to position on slider container
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener("click", handleSliderClick);
        }
        
        console.log("Slider events initialized");
    } else {
        console.error("Slider divider not found!");
    }
});

function handleSliderClick(e) {
    if (isDragging) return; // Don't handle clicks while dragging
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    updateSliderPosition(percentage);
}

function startDrag(e) {
    console.log("Starting drag");
    isDragging = true;
    startX = e.clientX;
    startPercentage = parseFloat(sliderDivider.style.left) || 50;
    
    // Add dragging styles
    sliderDivider.style.cursor = "grabbing";
    sliderDivider.style.userSelect = "none";
    
    e.preventDefault();
}

function startDragTouch(e) {
    console.log("Starting touch drag");
    isDragging = true;
    startX = e.touches[0].clientX;
    startPercentage = parseFloat(sliderDivider.style.left) || 50;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const containerWidth = sliderDivider.parentElement.offsetWidth;
    const deltaPercentage = (deltaX / containerWidth) * 100;
    const newPercentage = startPercentage + deltaPercentage;
    
    updateSliderPosition(newPercentage);
}

function dragTouch(e) {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const containerWidth = sliderDivider.parentElement.offsetWidth;
    const deltaPercentage = (deltaX / containerWidth) * 100;
    const newPercentage = startPercentage + deltaPercentage;
    
    updateSliderPosition(newPercentage);
    
    e.preventDefault();
}

function stopDrag() {
    if (isDragging) {
        console.log("Stopping drag");
        isDragging = false;
        sliderDivider.style.cursor = "ew-resize";
        sliderDivider.style.userSelect = "auto";
    }
}

// Check server health on page load
async function checkServerHealth() {
    try {
        const response = await fetch("http://localhost:8000/health");
        if (response.ok) {
            console.log("Server is healthy");
        } else {
            console.warn("Server health check failed");
        }
    } catch (error) {
        console.warn("Cannot connect to server:", error.message);
    }
}

// Check server health when page loads
document.addEventListener("DOMContentLoaded", checkServerHealth);
