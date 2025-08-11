"use client";
export default function MapBackdrop() {
  // OSM embed como fundo estático, sem interações
  const src =
    "https://www.openstreetmap.org/export/embed.html?bbox=-74.1%2C-33.7%2C-34.8%2C5.4&layer=mapnik";
  return (
    <div className="fixed inset-0 -z-10">
      <iframe
        title="map"
        src={src}
        className="w-full h-full"
        style={{ filter: "grayscale(1) opacity(0.2)", pointerEvents: "none", border: 0 }}
      />
    </div>
  );
}


