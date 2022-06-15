import {
	InboxOutlined,
	MedicineBoxTwoTone,
	PrinterTwoTone,
	UserOutlined,
} from "@ant-design/icons";

import { Col, Row } from "antd";
import { useSelector } from "react-redux";
import CardDashboard from "../UI/CardDashboard";
const Dashboard = () => {
	const { role } = useSelector((state) => state.auth);

	return (
		<Row>
			{/* <Title level={3} style={{ marginTop: "2rem" }}>
				Add New Ones
			</Title> */}
			<Row
				gutter={[48, 48]}
				style={{
					marginTop: "2rem",
					marginRight: "-1rem",
				}}
			>
				<Col lg={role === "admin" ? 6 : 8} md={12} sm={12}>
					<CardDashboard path="/addInvoice" title="Generate Invoice">
						<PrinterTwoTone
							style={{ float: "left", fontSize: "2rem" }}
						/>
					</CardDashboard>
				</Col>
				<Col lg={role === "admin" ? 6 : 8} md={12} sm={12}>
					<CardDashboard
						path="/manageDrugs"
						title={role === "admin" ? "Manage Drug" : "Show Drug"}
					>
						<MedicineBoxTwoTone
							style={{ float: "left", fontSize: "2rem" }}
						/>
					</CardDashboard>
				</Col>
				<Col lg={role === "admin" ? 6 : 8} md={12} sm={12}>
					<CardDashboard
						path="/manageStock"
						title={role === "admin" ? "Manage Stock" : "Show Stock"}
					>
						<InboxOutlined
							style={{ float: "left", fontSize: "2rem" }}
						/>
					</CardDashboard>
				</Col>
				<Col lg={role === "admin" ? 6 : 8} md={12} sm={12}>
					<CardDashboard
						path="/manageSupplier"
						title={
							role === "admin"
								? "Manage Supplier"
								: "Show Supplier"
						}
					>
						<UserOutlined
							style={{ float: "left", fontSize: "2rem" }}
						/>
					</CardDashboard>
				</Col>
				<Col lg={6} md={12} sm={12}>
					{role === "admin" && (
						<CardDashboard path="/manageStaff" title="Manage Staff">
							<UserOutlined
								style={{ float: "left", fontSize: "2rem" }}
							/>
						</CardDashboard>
					)}
				</Col>
			</Row>
		</Row>
	);
};
export default Dashboard;
