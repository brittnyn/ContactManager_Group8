// Dynamic Bubble Creation
function createBubbles() 
{
    const bubblesContainer = document.querySelector('.bubbles');
    
    for (let i = 0; i < 15; i++) 
    {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 10px and 60px
        const size = Math.random() * 50 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        
        // Random animation duration between 5s and 15s
        const duration = Math.random() * 10 + 5;
        bubble.style.animationDuration = `${duration}s`;
        
        // Random delay
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random opacity
        bubble.style.opacity = Math.random() * 0.5 + 0.1;
        
        bubblesContainer.appendChild(bubble);
    }
}

createBubbles();