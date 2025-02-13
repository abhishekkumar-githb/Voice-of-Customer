import React, { useEffect, useState } from "react";
import { MapPin, Clock, ChevronRight, Search, Map } from "lucide-react";
import Datacubeservices from "./databaseSerivce.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const LocationDataVisualization = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clean marker icon without any shadows and better transparency handling
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center transform hover:scale-110 transition-transform duration-200" style="background-color: rgba(59, 130, 246, 0.9);">
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div class="w-2 h-2 rotate-45" style="background-color: rgba(59, 130, 246, 0.9);"></div>
        </div>
        <div class="absolute top-0 left-0 right-0 bottom-0">
          <div class="w-6 h-6 rounded-full animate-ping" style="background-color: rgba(59, 130, 246, 0.2);"></div>
        </div>
      </div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
  });

  // Rest of the component remains exactly the same
  const apiKey = "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f";
  const databaseName = "voc";
  const collectionName = "user_location_data";
  const filters = { 
    workspaceId: "66c3a354c0c8c6fbadd5fed4", 
    event: "scanned", 
    scaleId: "66c9d21e9090b1529d108a63" 
  };
  const limit = 1000;
  const offset = 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const datacube = new Datacubeservices(apiKey);
        const result = await datacube.dataRetrieval(
          databaseName,
          collectionName,
          filters,
          limit,
          offset
        );
        console.log("Received locations:", result.data?.length);
        setData(result.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBounds = () => {
    if (data.length === 0) return [[0, 0], [0, 0]];
    const lats = data.map(loc => loc.latitude);
    const lngs = data.map(loc => loc.longitude);
    return [
      [Math.min(...lats) - 1, Math.min(...lngs) - 1],
      [Math.max(...lats) + 1, Math.max(...lngs) + 1]
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Global Location Tracker</h1>
          <p className="text-blue-600">
            Monitoring {data.length} locations worldwide
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600">Loading global locations...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            Error: {error}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    World Map View
                  </h2>
                  <span className="text-sm text-blue-600">
                    {data.length} locations found
                  </span>
                </div>
                <div className="h-[600px] rounded-xl overflow-hidden">
                  <MapContainer 
                    bounds={getBounds()}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {data.map((location) => (
                      <Marker
                        key={location._id}
                        position={[location.latitude, location.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                          click: () => setSelectedLocation(location),
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="bg-white p-3 rounded-lg shadow-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Location Details</h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <span className="font-medium">Latitude:</span> {location.latitude.toFixed(6)}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium">Longitude:</span> {location.longitude.toFixed(6)}
                              </p>
                              <p className="text-gray-500 text-xs mt-2">
                                {formatDate(location.createdAt)}
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-6">All Locations</h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {data.map((location) => (
                    <div
                      key={location._id}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedLocation?._id === location._id
                          ? "bg-blue-100 border-blue-200"
                          : "bg-gray-50 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(location.createdAt)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDataVisualization;