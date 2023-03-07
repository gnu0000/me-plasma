"use strict";

// plasma.js
//
// This demo paints a canvas with a plasma fractal. It uses a simple
// recursive formula to pick the color at each pixel. I made this
// because I dreamed about the ancient Fractint program I used to
// play with many years ago.
//   This has a quirk where the colors are not picked smoothly. It
// almost looks like there are imbedded koch snowflakes in the plasma.
// I left it as is because I think it looks cool.
//
// Craig Fitzgerald 2023

class PlasmaGenerator {
   constructor() {
      this.$canvas = $("#canvas");
      this.canvas  = this.$canvas.get(0);
      this.ctx     = this.canvas.getContext("2d", {willReadFrequently: true});
      this.noise   = 0.00025;
      this.timeout = 0;

      $(window).on("resize", ()=>this.HandleSizeChange());

      this.InitState();
      this.Resize();
      this.DrawPlasma();
   }

   InitState() {
      this.c0 = Math.random();
      this.c1 = Math.random();
      this.c2 = Math.random();
      this.c3 = Math.random();
   }

   Resize() {
      let x = $(window).width();
      let y = $(window).height();
      this.$canvas.width (x);
      this.$canvas.height(y);
      this.canvas.width  = x;
      this.canvas.height = y;
   }

   HandleSizeChange() {
      this.Resize();
      if (this.timeout)
         clearTimeout(this.timeout);
      this.timeout = setTimeout(()=>this.DrawPlasma(), 250);
   }

   DrawPlasma() {
      this.timeout = 0;
      let x  = this.canvas.width;
      let y  = this.canvas.height;

      this.imageData = this.ctx.getImageData(0, 0, x, y);
      this.CalcPlasma(0, 0, y-1, x-1, this.c0, this.c1, this.c2, this.c3);
      this.ctx.putImageData(this.imageData, 0, 0);
   }

   CalcPlasma(t, l, b, r, c0, c1, c2, c3) {
      if (l > r || t > b) return;

      if (l == r && t == b) {
         let idx = (t * this.canvas.width + l) * 4;
         let [r, g, b] = this.HSLToRGB(Math.floor(c0 * 360), 100, 50);
         this.imageData.data[idx    ] = r;
         this.imageData.data[idx + 1] = g;
         this.imageData.data[idx + 2] = b;
         this.imageData.data[idx + 3] = 255;
         return;
      }
      let mx = this.MidI(l, r );
      let my = this.MidI(t, b );
      let tc = this.Mid(c0, c1);
      let lc = this.Mid(c0, c2);
      let bc = this.Mid(c2, c3);
      let rc = this.Mid(c1, c3);
      let cc = this.CenterClr(c0, c1, c2, c3, ((r-l)**2 + (b-t)**2)**0.5);

      this.CalcPlasma(t,    l,    my, mx, c0, tc, lc, cc);
      this.CalcPlasma(t,    mx+1, my, r,  tc, c1, cc, rc);
      this.CalcPlasma(my+1, l,    b,  mx, lc, cc, c2, bc);
      this.CalcPlasma(my+1, mx+1, b,  r,  cc, rc, bc, c3);
   }

   Mid(a, b) {
      return a + (b - a)/2;
   }

   MidI(a, b) {
      return Math.floor(a + (b - a)/2);
   }

   CenterClr(c0, c1, c2, c3, dist) {
      return (c0 + c1 + c2 + c3) / 4 + dist * this.noise;
   }

   Bound(f) {
      return Math.round(Math.min(255, Math.max(0, f)));
   }

   // HSL to RGB algorithm optimized beyond recognition
   // https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
   HSLToRGB(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
         const k = (n + h / 30) % 12;
         const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
         return Math.round(255 * color);
      };
      return [f(0), f(8), f(4)];
   }
}


$(function() {
   let p = new PlasmaGenerator("#canvas", {});
});
