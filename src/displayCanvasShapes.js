import cacheShapes from "./cacheShapes.js";
import drawShape from "./drawShape.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * 0.6 * dpr;
canvas.height = window.innerHeight * 0.8 * dpr;
const buttons = document.getElementById("colliders");

const colliderShapes = [];
let shapeObjects = []; // Store shapeObjects persistently
let sx, sy, ex, ey, shape;
let isDrawing = false;
let animationId = null;

buttons.addEventListener("click", (e) => {
  e.preventDefault();
  let target = e.target.id;
  if (target === "colliders") return;
  shape = target;
  canvas.addEventListener("mousedown", handleMouseDown);
});

const handleMouseDown = (e) => {
  sx = e.clientX - canvas.getBoundingClientRect().left;
  sy = e.clientY - canvas.getBoundingClientRect().top;
  ex = sx;
  ey = sy;
  isDrawing = true;
  startAnimation(); // Start animation loop

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e) => {
  if (!isDrawing) return;
  ex = e.clientX - canvas.getBoundingClientRect().left;
  ey = e.clientY - canvas.getBoundingClientRect().top;
};

const handleMouseUp = () => {
  isDrawing = false;
  logColiderShapes({ shape, sx, sy, ex, ey });
  colliderShapes.push({ shape, sx, sy, ex, ey });
  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
  stopAnimation(); // Stop animation after drawing ends
};

const drawColliderShape = (ctx, { shape, sx, sy, ex, ey }) => {
  ctx.beginPath();
  if (shape === "rect") {
    ctx.rect(sx, sy, ex - sx, ey - sy);
  } else if (shape === "arc") {
    const radius = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  }
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.stroke();
};

const logColiderShapes = ({ shape, sx, sy, ex, ey }) => {
  let width = shapeObjects[0].svg.width / 2;
  let height = shapeObjects[0].svg.height / 2;
  const normalize = (val, offset, dimension) =>
    val - canvas[dimension] / 16 + offset;

  const scale = 1 / 8;
  const x = sx * scale;
  const y = sy * scale;
  const dx = ex * scale;
  const dy = ey * scale;
  let log = null;
  if (shape === "rect") {
    log = {
      rect: {
        x: normalize(x, width, "width"),
        y: normalize(y, height, "height"),
        width: dx - x,
        height: dy - y,
      },
    };
  } else if (shape === "arc") {
    log = {
      arc: {
        cx: normalize(x, width, "width"),
        cy: normalize(y, height, "height"),
        r: Math.hypot(dx - x, dy - y),
      },
    };
  }

  console.log("collider", log);
};

export default function displayCanvasShapes(newShapeObjects) {
  if (newShapeObjects) {
    shapeObjects = newShapeObjects; // Persist shapes across calls
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cachedShapes = cacheShapes(shapeObjects);

  drawShape(ctx, cachedShapes);
  colliderShapes.forEach((shape) => drawColliderShape(ctx, shape));
  if (isDrawing) {
    drawColliderShape(ctx, { shape, sx, sy, ex, ey });
  }
}

const animationLoop = () => {
  displayCanvasShapes(); // Only refresh the canvas, keeping shapeObjects unchanged
  animationId = requestAnimationFrame(animationLoop);
};

const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const startAnimation = () => {
  if (!animationId) {
    animationLoop();
  }
};
