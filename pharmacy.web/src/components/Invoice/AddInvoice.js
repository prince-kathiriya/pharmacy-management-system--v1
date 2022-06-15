import { Col } from "antd";
import CardTable from "../UI/CardTable";
// import InvoiceInfo from "./InvoiceInfo";
import InvoiceTable from "./InvoiceTable";
const AddInvoice = () => {
	return (
		<CardTable>
			<Col span={24}>
				<InvoiceTable />
			</Col>
		</CardTable>
	);
};

export default AddInvoice;
