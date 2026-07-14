import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Calendar,
  Fuel,
  Wallet,
  Car,
  AlertCircle,
  FileText,
} from "lucide-react";


const DriverDashboard = () => {
  const { id } = useParams();
 
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    fetch(`http://192.168.68.105:3000/api/drivers/public/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDriver(data.driver);
      })
      .catch(console.error);
  }, [id]);

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <span className="loading loading-spinner loading-lg text-blue-900"></span>
      </div>
    );
  }

  const statusColor =
    driver.status === "Active"
      ? "bg-green-600"
      : "bg-red-600";

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <div className="bg-blue-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-8 py-8">

          <h1 className="text-3xl font-bold">
            SAN PEDRO TRANSPORT COOPERATIVE
          </h1>

          <p className="opacity-80">
            Verified Driver Information Portal
          </p>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* PROFILE */}

        <div className="bg-white rounded-xl shadow-lg p-8">

          <div className="flex flex-col lg:flex-row gap-10">

            <img
              src={
                driver.profileImage
                  ? `http://192.168.68.105:3000/${driver.profileImage}`
                  : "https://placehold.co/250x250?text=Driver"
              }
              className="w-60 h-60 rounded-xl object-cover border-4 border-blue-900"
              alt="Driver"
            />

            <div className="flex-1">

              <h2 className="text-4xl font-bold">
                {driver.firstName}{" "}
                {driver.middleName}{" "}
                {driver.lastName}
              </h2>

              <span
                className={`${statusColor} inline-flex items-center gap-2 text-white px-4 py-2 rounded-full mt-5`}
              >
                <BadgeCheck size={18} />
                {driver.status}
              </span>

              <div className="grid md:grid-cols-2 gap-5 mt-8">

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <Car size={18} />

                    License Number

                  </div>

                  <p>{driver.licenseNumber || "-"}</p>

                </div>

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <Phone size={18} />

                    Phone

                  </div>

                  <p>{driver.phone || "-"}</p>

                </div>

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <Mail size={18} />

                    Email

                  </div>

                  <p>{driver.email || "-"}</p>

                </div>

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <MapPin size={18} />

                    Address

                  </div>

                  <p>{driver.address || "-"}</p>

                </div>

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <User size={18} />

                    License Type

                  </div>

                  <p>{driver.licenseType || "-"}</p>

                </div>

                <div className="bg-slate-100 rounded-xl p-5">

                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">

                    <Calendar size={18} />

                    License Expiry

                  </div>

                  <p>
                    {driver.licenseExpiry
                      ? new Date(driver.licenseExpiry).toLocaleDateString()
                      : "-"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
  <div className="flex justify-between">
    <p className="text-gray-900">
      Lifetime Fuel Cost
    </p>

    <Wallet className="text-blue-900" />
  </div>

  <h2 className="text-3xl font-bold mt-3">
    ₱{Number(driver.totalLifetimeFuelCost || 0).toLocaleString()}
   </h2>
  </div>


          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <p className="text-gray-900">
                Diesel Consumption
              </p>

              <Fuel className="text-blue-900" />

            </div>

            <h2 className="text-3xl font-bold mt-3">
              {driver.totalLifetimeDieselConsumption || 0}
            </h2>

          </div>

                    <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <p className="text-gray-900">
                Lifetime Remittance
              </p>

              <Wallet className="text-blue-900" />

            </div>

            <h2 className="text-3xl font-bold mt-3">
              ₱{Number(driver.totalLifetimeRemit || 0).toLocaleString()}
            </h2>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex justify-between">

              <p className="text-gray-900">
                Registered
              </p>

              <Calendar className="text-blue-900" />

            </div>

            <h2 className="text-xl font-bold mt-3">
              {driver.createdAt
                ? new Date(driver.createdAt).toLocaleDateString()
                : "-"}
            </h2>

          </div>

        </div>

        {/* EMERGENCY CONTACT */}

        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

            <AlertCircle />

            Emergency Contact

          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>

              <p className="text-gray-900">
                Name
              </p>

              <h3 className="font-semibold text-lg">
                {driver.emergencyContact?.name || "N/A"}
              </h3>

            </div>

            <div>

              <p className="text-gray-900">
                Relationship
              </p>

              <h3 className="font-semibold text-lg">
                {driver.emergencyContact?.relationship || "N/A"}
              </h3>

            </div>

            <div>

              <p className="text-gray-900">
                Contact Number
              </p>

              <h3 className="font-semibold text-lg">
                {driver.emergencyContact?.phone || "N/A"}
              </h3>

            </div>

          </div>

        </div>

        {/* DOCUMENTS */}

        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

            <FileText />

            Uploaded Documents

          </h2>

          {driver.documents?.length === 0 ? (

            <div className="text-center py-10 text-gray-900">

              No uploaded documents.

            </div>

          ) : (

            <div className="grid md:grid-cols-3 gap-5">

              {driver.documents.map((doc, index) => (

                <a
                  key={index}
                  href={`http://192.168.68.105:3000/${doc}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-900 hover:bg-blue-800 transition text-white rounded-xl p-6 text-center font-semibold shadow"
                >

                  Document {index + 1}

                </a>

              ))}

            </div>

          )}

        </div>

        {/* FOOTER */}

        <div className="text-center py-8 text-gray-900">

          Powered by{" "}

          <span className="font-bold text-blue-900">

            SAN PEDRO TRANSPORT COOPERATIVE SYSTEM

          </span>

        </div>

      </div>

    </div>

  );

};

export default DriverDashboard;