import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoggedOutRoute from "./components/LoggedOutRoute";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Family from "./pages/Family";
import AddItem from "./pages/AddItem";
import ReserveItem from "./pages/ReserveItem";
import Reservation from "./pages/Reservation";
import NotFound from "./pages/NotFound";

function App() {
	return (
		<Router>
			<Routes>
				{/* Public routes */}
				<Route
					path="/signup"
					element={
						<LoggedOutRoute>
							<Signup />
						</LoggedOutRoute>
					}
				/>
				<Route
					path="/login"
					element={
						<LoggedOutRoute>
							<Login />
						</LoggedOutRoute>
					}
				/>
				<Route
					path="/"
					element={
						<LoggedOutRoute>
							<Landing />
						</LoggedOutRoute>
					}
				/>

				{/* Protected routes */}
				<Route
					path="/home"
					element={
						<ProtectedRoute>
							<Home />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<Settings />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/family/:id"
					element={
						<ProtectedRoute>
							<Family />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/add-item"
					element={
						<ProtectedRoute>
							<AddItem />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/reserve/"
					element={
						<ProtectedRoute>
							<ReserveItem />
						</ProtectedRoute>
				  }
				/>
				<Route
					path="/reservation/:reservationId"
					element={
						<ProtectedRoute>
							<Reservation />
						</ProtectedRoute>
					}
				/>

				{/* 404: Page not found */}
				<Route path='*' element={<NotFound />} />
			</Routes>
		</Router>
	);
}

export default App;
