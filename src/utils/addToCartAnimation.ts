import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  actual_price: number;
  thumbnail_image: string;
}

interface AnimationConfig {
  sourceElement: HTMLElement;
  targetElement: HTMLElement;
  product: Product;
  size: string;
  color: { name: string; hex: string };
  quantity: number;
  onComplete: () => void;
}

// Create ghost clone of product
export function createGhostClone(
  sourceElement: HTMLElement,
  product: Product,
  size: string,
  color: { name: string; hex: string },
  quantity: number
): HTMLElement {
  const clone = document.createElement('div');
  clone.className = 'fixed z-[9999] pointer-events-none';
  
  const rect = sourceElement.getBoundingClientRect();
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  
  clone.innerHTML = `
    <div class="bg-white rounded-lg shadow-2xl overflow-hidden h-full flex flex-col">
      <div class="relative flex-shrink-0" style="aspect-ratio: 9/16; max-height: 60%;">
        <img src="${product.thumbnail_image}" alt="${product.name}" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 p-2 flex flex-col justify-between">
        <div>
          <h3 class="text-xs font-medium line-clamp-2 mb-1">${product.name}</h3>
          <div class="flex gap-1 mb-1">
            <span class="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Size: ${size}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded" style="background-color: ${color.hex}; color: ${color.hex === '#FFFFFF' ? '#000' : '#FFF'}">
              ${color.name}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-gray-600">Qty: ${quantity}</span>
          <span class="text-xs font-bold">Rs. ${(product.actual_price * quantity).toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(clone);
  return clone;
}

// Create particle explosion effect
export function createParticleExplosion(x: number, y: number): void {
  const particleCount = 12;
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'fixed z-[9998] pointer-events-none';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.backgroundColor = colors[i % colors.length];
    
    document.body.appendChild(particle);
    
    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = 80 + Math.random() * 40;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let posX = 0;
    let posY = 0;
    let opacity = 1;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 400; // 400ms duration
      
      if (progress >= 1) {
        particle.remove();
        return;
      }
      
      posX = vx * progress;
      posY = vy * progress + (0.5 * 200 * progress * progress); // gravity
      opacity = 1 - progress;
      
      particle.style.transform = `translate(${posX}px, ${posY}px) scale(${1 - progress * 0.5})`;
      particle.style.opacity = opacity.toString();
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
}

// Create ripple effect
export function createRippleEffect(x: number, y: number): void {
  const ripple = document.createElement('div');
  ripple.className = 'fixed z-[9997] pointer-events-none';
  ripple.style.left = `${x - 50}px`;
  ripple.style.top = `${y - 50}px`;
  ripple.style.width = '100px';
  ripple.style.height = '100px';
  ripple.style.borderRadius = '50%';
  ripple.style.border = '3px solid rgba(0, 0, 0, 0.3)';
  
  document.body.appendChild(ripple);
  
  let scale = 0;
  let opacity = 1;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / 300; // 300ms duration
    
    if (progress >= 1) {
      ripple.remove();
      return;
    }
    
    scale = progress * 2;
    opacity = 1 - progress;
    
    ripple.style.transform = `scale(${scale})`;
    ripple.style.opacity = opacity.toString();
    
    requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}

// Main animation function
export async function playAddToCartAnimation(config: AnimationConfig): Promise<void> {
  const { sourceElement, targetElement, product, size, color, quantity, onComplete } = config;
  
  // Step 1: Create ghost clone
  const clone = createGhostClone(sourceElement, product, size, color, quantity);
  
  // Step 2: Get positions
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  
  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;
  
  // Step 3: Animate flight with bezier curve
  const duration = 800; // 800ms flight
  const startTime = Date.now();
  
  await new Promise<void>((resolve) => {
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Bezier curve calculation (quadratic)
      const controlX = (startX + endX) / 2;
      const controlY = Math.min(startY, endY) - 100; // Arc upward
      
      const t = progress;
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
      
      // Shrink and rotate during flight
      const scale = 1 - progress * 0.3; // Shrink to 70%
      const rotation = progress * 15; // Rotate 15 degrees
      
      clone.style.left = `${x - (sourceRect.width * scale) / 2}px`;
      clone.style.top = `${y - (sourceRect.height * scale) / 2}px`;
      clone.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
      clone.style.opacity = (1 - progress * 0.2).toString(); // Slight fade
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    
    requestAnimationFrame(animate);
  });
  
  // Step 4: Blast effect at destination
  createParticleExplosion(endX, endY);
  createRippleEffect(endX, endY);
  
  // Step 5: Fade out clone
  clone.style.transition = 'opacity 0.2s';
  clone.style.opacity = '0';
  
  setTimeout(() => {
    clone.remove();
  }, 200);
  
  // Step 6: Trigger completion
  onComplete();
}

// Shake animation for validation errors
export function shakeElement(element: HTMLElement): void {
  const shakeAnimation = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' },
  ];
  
  element.animate(shakeAnimation, {
    duration: 400,
    easing: 'ease-in-out',
  });
}

// Bounce animation for cart count
export function bounceElement(element: HTMLElement): void {
  const bounceAnimation = [
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(0.9)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(1)' },
  ];
  
  element.animate(bounceAnimation, {
    duration: 400,
    easing: 'ease-in-out',
  });
}

// Wiggle animation for cart icon
export function wiggleElement(element: HTMLElement): void {
  const wiggleAnimation = [
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(-15deg)' },
    { transform: 'rotate(15deg)' },
    { transform: 'rotate(-10deg)' },
    { transform: 'rotate(10deg)' },
    { transform: 'rotate(0deg)' },
  ];
  
  element.animate(wiggleAnimation, {
    duration: 500,
    easing: 'ease-in-out',
  });
}
