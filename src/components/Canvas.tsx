import { useEffect, useRef } from "react";
import useWindowSize from "../hooks/useWindowSize";

import Matter, { Body } from "matter-js";

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { width, height } = useWindowSize();

  const cw = width;
  const ch = height;
  let Bodies = Matter.Bodies;

  const isMobile = width < 580;

  const floor = Bodies.rectangle(cw / 2, isMobile ? 480 : ch / 1.45, cw, 100, {
    isStatic: true,
    render: {
      fillStyle: "none",
    },
  });

  const floorLeft = Bodies.rectangle(-50, ch / 2, 100, ch, {
    isStatic: true,
    render: {
      fillStyle: "none",
    },
  });

  const floorRight = Bodies.rectangle(cw + 50, ch / 2, 100, ch, {
    isStatic: true,
    render: {
      fillStyle: "none",
    },
  });

  const floorTop = Bodies.rectangle(cw / 2, -100, cw, 100, {
    isStatic: true,
    render: {
      fillStyle: "none",
    },
  });

  const logo = Bodies.rectangle(
    cw / 2,
    20,
    Math.min(370, cw * 0.6),
    Math.min(120, cw * 0.2),
    {
      chamfer: {
        radius: [Math.min(120, cw * 0.2) / 2, Math.min(120, cw * 0.2) / 2],
      },
      render: {
        fillStyle: "#fff",
        // sprite: {
        //   texture: "/assets/main/wezet_logo.png",
        //   xScale: isMobile ? 0.45 : 0.75,
        //   yScale: isMobile ? 0.45 : 0.75,
        // },
      },
      restitution: 0.6,
    }
  );

  useEffect(() => {
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let World = Matter.World;

    let engine = Engine.create();

    let render = Render.create({
      element: containerRef.current as HTMLElement,
      engine: engine,
      canvas: canvasRef.current as any,
      bounds: {
        min: { x: 0, y: 0 },
        max: { x: cw, y: ch },
      },
      options: {
        showSeparations: true,
        width: cw,
        height: ch,
        background: "",
        wireframes: false,
      },
    });

    engine.gravity.y = isMobile ? 2 : 1.5;

    const mouse = Matter.Mouse.create(render.canvas),
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });

    World.add(engine.world, [
      floor,
      floorLeft,
      floorRight,
      floorTop,
      logo,
      mouseConstraint,
    ]);

    mouseConstraint.mouse.element.removeEventListener(
      "mousewheel",
      //@ts-ignore
      mouseConstraint.mouse.mousewheel
    );
    mouseConstraint.mouse.element.removeEventListener(
      "DOMMouseScroll",
      //@ts-ignore
      mouseConstraint.mouse.mousewheel
    );
    mouseConstraint.mouse.element.removeEventListener(
      "touchstart", //@ts-ignore
      mouseConstraint.mouse.mousedown
    );
    mouseConstraint.mouse.element.removeEventListener(
      "touchmove", //@ts-ignore
      mouseConstraint.mouse.mousemove
    );
    mouseConstraint.mouse.element.removeEventListener(
      "touchend", //@ts-ignore
      mouseConstraint.mouse.mouseup
    );

    mouseConstraint.mouse.element.addEventListener(
      "touchstart", //@ts-ignore
      mouseConstraint.mouse.mousedown,
      { passive: false }
    );
    mouseConstraint.mouse.element.addEventListener(
      "touchmove",
      (e) => {
        if (mouseConstraint.body) {
          //@ts-ignore
          mouseConstraint.mouse.mousemove(e);
        }
      },
      { passive: false }
    );
    mouseConstraint.mouse.element.addEventListener(
      "touchend",
      (e) => {
        if (mouseConstraint.body) {
          //@ts-ignore
          mouseConstraint.mouse.mouseup(e);
        }
      },
      { passive: false }
    );

    Matter.Runner.run(engine);
    Render.run(render);
    Body.rotate(logo, Math.PI / 6);

    return () => {
      // destroy Matter
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [width]);

  return (
    <section
      ref={containerRef}
      className="w-full h-screen min-h-screen flex flex-col justify-center bg-[#282c34]"
    >
      <canvas
        ref={canvasRef}
        id="viewport"
        width="500"
        height="500"
        className="absolute top-0"
      />
    </section>
  );
};

export default Canvas;
