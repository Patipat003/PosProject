import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ตั้งค่าไอคอนหมุด
const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BranchMap = ({ branches, onBranchClick }) => {
  return (
    <MapContainer center={[14.736717, 104.523186]} zoom={5} className="h-96 w-full rounded-lg shadow-lg" style={{ zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {branches.map((branch) => {
        const [lat, lng] = branch.google_location?.split(",").map(Number) || [13.736717, 100.523186];

        return (
          <Marker 
            key={branch.branchid} 
            position={[lat, lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => onBranchClick(branch), // คลิกหมุดเพื่อเปิด View Modal
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">{branch.bname}</p>
                <p className="text-gray-600">{branch.location}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BranchMap;
