import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Car, User, Fuel, MapPin, Calendar, QrCode,} from "lucide-react";

const UnitDashboard = () => {
  
  const { id } = useParams();

  const [unit, setUnit] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/units/public/${id}`)

    fetch(`http://192.168.68.105:3000/api/units/public/${id}`)
      .then(res => res.json())
      .then(data => {

        console.log(data);

        setUnit(data.unit);

      })
      .catch(console.error);

  }, [id]);

  if (!unit) {

    return (

      <div className="flex justify-center items-center h-screen">

        <span className="loading loading-spinner loading-lg"></span>

      </div>

    );

  }

  const availabilityColor =

    unit.availabilityStatus === "Available"

      ? "bg-green-600"

      : unit.availabilityStatus === "On Route"

      ? "bg-blue-600"

      : unit.availabilityStatus === "Under Maintenance"

      ? "bg-orange-500"

      : "bg-red-600";

  const maintenanceColor =

    unit.maintenanceStatus === "Good"

      ? "bg-green-600"

      : unit.maintenanceStatus === "Needs Maintenance"

      ? "bg-orange-500"

      : "bg-red-600";

  return (

<div className="min-h-screen bg-slate-100">

<div className="bg-blue-900 text-white shadow-lg">

<div className="max-w-7xl mx-auto px-8 py-8">

<h1 className="text-3xl font-bold">

SAN PEDRO TRANSPORT COOPERATIVE

</h1>

<p className="opacity-80">

Vehicle Information Portal

</p>

</div>

</div>

<div className="max-w-7xl mx-auto p-8 space-y-8">

<div className="bg-white rounded-xl shadow-lg p-8">

<div className="flex flex-col lg:flex-row gap-10">

<div className="flex flex-col items-center">

<img

src={unit.qrCode}

className="w-56 h-56 rounded-xl border-4 border-blue-900"

/>

<p className="mt-4 text-gray-900">

Official Vehicle QR Code

</p>

</div>

<div className="flex-1">

<h2 className="text-4xl font-bold">

Plate No. {unit.plateNumber}

</h2>

<p className="text-gray-900 mt-2">

Body Number: {unit.bodyNumber}

</p>

<div className="flex gap-3 mt-6">

<span className={`${availabilityColor} text-white px-4 py-2 rounded-full`}>

{unit.availabilityStatus}

</span>

<span className={`${maintenanceColor} text-white px-4 py-2 rounded-full`}>

{unit.maintenanceStatus}

</span>

</div>

<div className="grid md:grid-cols-2 gap-5 mt-8">

<div className="bg-slate-100 rounded-xl p-5">

<div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">

<Car size={18} />

Unit Type

</div>

<p>{unit.unitType}</p>

</div>

<div className="bg-slate-100 rounded-xl p-5">

<div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">

<Fuel size={18} />

Fuel Type

</div>

<p>{unit.fuelType}</p>

</div>

<div className="bg-slate-100 rounded-xl p-5">

<div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">

<User size={18} />

Capacity

</div>

<p>{unit.capacity}</p>

</div>

<div className="bg-slate-100 rounded-xl p-5">

<div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">

<MapPin size={18} />

Route

</div>

<p>{unit.route || "Not Assigned"}</p>

</div>

</div>

</div>

</div>

</div>

<div className="grid md:grid-cols-2 gap-8">

  {/* Driver Assigned */}

  <div className="bg-white rounded-xl shadow-lg p-8">

    <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

      <User />

      Driver Assigned

    </h2>

    {unit.driverAssigned ? (

      <div className="space-y-4">

        <div>

          <p className="text-gray-900">

            Driver Name

          </p>

          <h3 className="font-bold text-lg">

            {unit.driverAssigned.firstName}{" "}
            {unit.driverAssigned.middleName}{" "}
            {unit.driverAssigned.lastName}

          </h3>

        </div>

        <div>

          <p className="text-gray-900">

            License Number

          </p>

          <h3>

            {unit.driverAssigned.licenseNumber}

          </h3>

        </div>

        <div>

          <p className="text-gray-900">

            Phone

          </p>

          <h3>

            {unit.driverAssigned.phone}

          </h3>

        </div>

        <div>

          <p className="text-gray-900">

            Driver Status

          </p>

          <h3>

            {unit.driverAssigned.status}

          </h3>

        </div>

      </div>

    ) : (

      <div className="text-gray-900">

        No Driver Assigned

      </div>

    )}

  </div>

  {/* Registration */}

  <div className="bg-white rounded-xl shadow-lg p-8">

    <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

      <Calendar />

      Registration Details

    </h2>

    <div className="space-y-5">

      <div>

        <p className="text-gray-900">

          Registration Expiry

        </p>

        <h3>

          {new Date(unit.registrationExpiry).toLocaleDateString()}

        </h3>

      </div>

      <div>

        <p className="text-gray-900">

          Insurance Expiry

        </p>

        <h3>

          {new Date(unit.insuranceExpiry).toLocaleDateString()}

        </h3>

      </div>

      <div>

        <p className="text-gray-900">

          Date Registered

        </p>

        <h3>

          {new Date(unit.createdAt).toLocaleDateString()}

        </h3>

      </div>

    </div>

  </div>

</div>

{/* Vehicle QR */}

<div className="bg-white rounded-xl shadow-lg p-8">

  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

    <QrCode />

    Vehicle QR Code

  </h2>

  <div className="flex flex-col items-center">

    <img

      src={unit.qrCode}

      className="w-72"

      alt="Vehicle QR"

    />

    <p className="text-gray-900 mt-5">

      Scan this QR code to view this vehicle's information.

    </p>

  </div>

</div>

<div className="text-center text-gray-900 py-8">

  Powered by{" "}

  <b>

    SAN PEDRO TRANSPORT COOPERATIVE SYSTEM

  </b>

</div>

</div>

</div>

);

};

export default UnitDashboard;