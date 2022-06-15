import { Col, Modal, Row, Table, Typography } from "antd";
import { useRef } from "react";
import { Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

const InvoicePrint = (props) => {
	const invoiceRef = useRef();

	const printHandler = useReactToPrint({
		content: () => invoiceRef.current,
	});

	const adminColumns = [
		{
			title: "Drug Name",
			dataIndex: "product",
			key: "product",
			width: "30%",
		},
		{
			title: "Drug Batch",
			dataIndex: "batch",
			key: "batch",
			width: "30%",
		},
		{
			title: "Drug Exp",
			dataIndex: "expDate",
			key: "expDate",
			width: "30%",
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			width: "13%",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			width: "13%",
		},
		{
			title: "Total",
			dataIndex: "total",
			key: "total",
			width: "13%",
		},
	];
	return (
		<>
			<Modal
				centered
				visible={props.visible}
				onCancel={props.onClose}
				width={1000}
			>
				<span>
					<Row
						style={{ marginTop: "1rem" }}
						ref={invoiceRef}
						className="invoiceSlip"
					>
						<Col span={12} style={{ marginBottom: "1rem" }}>
							<Typography.Title level={3}>
								Customer Name: {props.invoiceData.customer}
							</Typography.Title>
						</Col>
						<Col
							span={12}
							style={{ display: "flex", justifyContent: "end" }}
						>
							<Typography.Title level={3}>
								Date: {props.invoiceData.date}
							</Typography.Title>
						</Col>
						<Col span={24}>
							<Table
								key="invoiceTable"
								pagination={false}
								columns={adminColumns}
								dataSource={props.invoiceData.orderItems.map(
									(x, ind) => {
										return { ...x, key: ind };
									}
								)}
								size="large"
							/>
						</Col>

						<Col
							span={7}
							offset={17}
							style={{
								display: "flex",
								justifyContent: "end",
								marginTop: "1rem",
							}}
						>
							<Typography.Title level={3}>
								Total Amount: {props.invoiceData.grandTotal}
							</Typography.Title>
						</Col>
						<Col
							span={7}
							offset={17}
							style={{
								display: "flex",
								justifyContent: "end",
								marginTop: "1rem",
							}}
							className="invoiceNotToPrint"
						>
							<Button
								className="invoiceNotToPrint"
								variant="success"
								onClick={() => {
									props.onClose();
									printHandler();
								}}
								style={{ width: "50%" }}
							>
								Print
							</Button>
						</Col>
					</Row>
				</span>
			</Modal>
		</>
	);
};
export default InvoicePrint;
