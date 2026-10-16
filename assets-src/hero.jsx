// Hero loop for backdownscenario.de: polyhedron floating in black, soft fog, faint gold shimmer.
// Image stays below its native size (no upscaling); everything is graded down to deep blacks.
// Run: effectcraft-cli script hero.jsx --empty, then render the "Hero" comp (see README).
var SRC = "C:/Users/Chris/Documents/Homestudio/Back Down Scenario/-- Images --/2025.07 ChatGPT/F2AD1007-7D54-4884-BAB1-22479CDDA63B_spot.png";
var OUT = "C:/Users/Chris/AppData/Local/Temp/bds-hero/hero.ecproj";
var DUR = 12, W = 1920, H = 1080;
var SCALE = 62, POLY_X = 0.43, TARGET_X = 0.36;

var item = app.project.importFile(new ImportOptions(new File(SRC)));
var comp = app.project.items.addComp("Hero", W, H, 1, DUR, 30);
comp.bgColor = [0.067, 0.067, 0.067];

// base image: smaller, polyhedron shifted left, edges feathered into the black
var base = comp.layers.add(item);
var iw = item.width * SCALE / 100;
var cx = TARGET_X * W - POLY_X * iw + iw / 2;
base.property("Transform").property("Position").setValue([cx, H / 2]);
base.property("Transform").property("Scale").expression =
  "var v=" + SCALE + "+1.2*Math.sin(2*Math.PI*time/" + DUR + "); [v,v]";
var mask = base.property("Masks").addProperty("Mask");
var shape = new Shape();
var m = 0.06;
shape.vertices = [[item.width * m, item.height * m], [item.width * (1 - m), item.height * m],
  [item.width * (1 - m), item.height * (1 - m)], [item.width * m, item.height * (1 - m)]];
shape.closed = true;
mask.property("Mask Path").setValue(shape);
mask.property("Mask Feather").setValue([item.width * 0.12, item.height * 0.12]);

// gold shimmer: duplicate with glow, very faint pulse
var glow = base.duplicate();
glow.name = "Shimmer";
var g = glow.property("Effects").addProperty("Glow");
g.property("Glow Threshold").setValue(55);
g.property("Glow Radius").setValue(45);
g.property("Glow Intensity").setValue(1.2);
glow.blendingMode = BlendingMode.SCREEN;
glow.property("Transform").property("Opacity").expression =
  "5+5*Math.sin(2*Math.PI*time/" + (DUR / 2) + ")";

// fog: large soft wisps, blurred so it doesn't break into blocks
var fog = comp.layers.addSolid([0, 0, 0], "Fog", W, H, 1, DUR);
var fn = fog.property("Effects").addProperty("Fractal Noise");
fn.property("Fractal Type").setValue(2);
fn.property("Contrast").setValue(240);
fn.property("Brightness").setValue(-125);
fn.property("Scale").setValue(800);
fn.property("Complexity").setValue(3);
fn.property("Cycle Evolution").setValue(1);
fn.property("Cycle (in Revolutions)").setValue(1);
fn.property("Evolution").expression = "time/" + DUR + "*360";
var blur = fog.property("Effects").addProperty("Gaussian Blur");
blur.property("Blurriness").setValue(24);
fog.blendingMode = BlendingMode.SCREEN;
fog.property("Transform").property("Opacity").setValue(16);

// grade: crush blacks, pull midtones down
var grade = comp.layers.addSolid([0, 0, 0], "Grade", W, H, 1, DUR);
grade.adjustmentLayer = true;
var lv = grade.property("Effects").addProperty("Levels");
lv.property("Input Black").setValue(0.05);
lv.property("Gamma").setValue(0.85);

app.project.save(new File(OUT));
writeLn("ok layers=" + comp.numLayers + " cx=" + cx);
