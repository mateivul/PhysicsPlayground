# PhysicsPlayground

This is a 2d sandbox I built to mess around with and learn to put physics concepts in code.
You can throw balls around, draw obstacles, watch how stuff moves, and change the physics params to make it more interesting.

---

You can launch a ball by clicking and dragging on the canvas; pull back like a slingshot. Right-click anywhere to just drop one with a radnom velocity. Draw lines with draw tool and send balls into them to see them bounce off. You can erase with the erase toll. And you can select a ball to see stats about it (position and velocity) and you can also move it around.

## Controls - keybinds

- [1] launch, [2] draw, [3] erase, [4] select
- [space] pause/resume
- [c] clears everything
- [delete] removes selected ball
- scroll wheel changes ball size

The sliders on the right control gravity, friction, and how elastic(bouncy) things are.

---

This was built with react + vite, no physics library, just pure math.

### To run after cloning

```
npm install
npm run dev
```
