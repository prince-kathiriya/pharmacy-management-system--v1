import { Form, Input, Button, DatePicker, Row, Col, Modal, Select } from "antd";
import { Button as ButtonB } from "react-bootstrap";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const dateToday = `${new Date().getDate()}/${
	new Date().getMonth() + 1
}/${new Date().getFullYear()}`;

const InvoiceTable = () => {
	const formRef = useRef();
	const [isSaved, setIsSaved] = useState(false);
	const [productsOptions, setProductsOptions] = useState([]);
	const [products, setProducts] = useState([]);
	const [stocks, setStocks] = useState({});
	const [stockDetails, setStockDetails] = useState({});
	const [grandTotal, setGrandTotal] = useState(0);
	const getProducts = async () => {
		try {
			let {
				data: { products },
			} = await axios.get("/api/v1/products");
			products = products.filter((prod) => prod.totalQuantity !== 0);
			setProducts([...products]);
			const options = [];
			products.map((product) =>
				options.push({
					label: product.name,
					value: product.name,
				})
			);
			setProductsOptions([...options]);
		} catch (error) {
			if (error.response.data.msg) {
				Modal.error({
					title: "Error",
					content: error.response.data.msg,
				});
			} else {
				Modal.error({
					title: "Error",
					content: "Operation failed.",
				});
			}
		}
	};
	const productChangeHandler = (productName, fieldKey) => {
		const index = products.findIndex(
			(product) => product.name === productName
		);

		const stocks = products[index].stocks;
		const stocksOptions = [];
		stocks.forEach((stock) => {
			stocksOptions.push({
				label: stock.batch,
				value: stock.batch,
			});
		});
		setStocks((prev) => {
			return { ...prev, [fieldKey]: { stocksOptions, productName } };
		});
	};

	const batchChangeHandler = (batchName, fieldKey) => {
		const productName = stocks[fieldKey]?.productName;
		const productIndex = products.findIndex(
			(product) => product.name === productName
		);
		const stocksFound = products[productIndex].stocks;
		const batchIndex = stocksFound.findIndex(
			(stock) => stock.batch === batchName
		);
		const stock = stocksFound[batchIndex];
		let { expDate, mfgDate, quantity } = stock;
		expDate = new Date(expDate);
		expDate = `${expDate.getFullYear()}-${
			expDate.getMonth() < 9
				? "0" + (expDate.getMonth() + 1)
				: expDate.getMonth() + 1
		}-${
			expDate.getDate().toString().length === 1
				? "0" + expDate.getDate().toString()
				: expDate.getDate()
		}`;
		mfgDate = new Date(mfgDate);
		mfgDate = `${mfgDate.getFullYear()}-${
			mfgDate.getMonth() < 9
				? "0" + (mfgDate.getMonth() + 1)
				: mfgDate.getMonth() + 1
		}-${
			mfgDate.getDate().toString().length === 1
				? "0" + mfgDate.getDate().toString()
				: mfgDate.getDate()
		}`;
		const { price } = products[productIndex];
		setStockDetails((prev) => {
			return {
				...prev,
				[fieldKey]: { expDate, mfgDate, quantity, price },
			};
		});
	};
	const quantityChangeHandler = (event, fieldKey) => {
		let total = 0;
		let price = stockDetails[fieldKey]?.price;
		total += +price * +event.target.value;
		setGrandTotal((prev) => prev + total);
		setStockDetails((prev) => {
			return {
				...prev,
				[fieldKey]: { ...prev[fieldKey], total },
			};
		});
	};
	useEffect(() => {
		let grandTotal = 0;
		for (const i in stockDetails) {
			if (stockDetails[i].total > 0) grandTotal += stockDetails[i].total;
		}
		setGrandTotal(grandTotal);
	}, [stockDetails]);
	useEffect(() => {
		getProducts();
	}, []);
	const [x, setX] = useState(true);
	const printHandler = useReactToPrint({
		content: () => formRef.current,
	});
	const onFinish = async (values) => {
		if (!values.drugs) {
			return Modal.error({
				title: "Error",
				content: "Please add some drugs.",
			});
		}
		let grandTotal = 0;
		let drugs = [];
		values.drugs.forEach((drug, index) => {
			const drugData = {
				product: drug.product,
				batch: drug.batch,
				expDate: drug.expDate,
				quantity: +drug.quantity,
				price: +stockDetails[index].price,
				total: +drug.quantity * +stockDetails[index].price,
			};
			grandTotal += drugData.total;
			drugs.push(drugData);
		});
		const requestData = {
			customer: values.name,
			date: values.date,
			grandTotal,
			orderItems: drugs,
		};
		try {
			if (!isSaved) await axios.post("/api/v1/invoices", requestData);
			// if (!isSaved) console.log("Saving");
			setX(false);
			setIsSaved(true);
		} catch (error) {
			console.log(error);
			if (error.response.data.msg) {
				Modal.error({
					title: "Error",
					content: error.response.data.msg,
				});
			} else {
				Modal.error({
					title: "Error",
					content: "Operation failed.",
				});
			}
		}
	};
	const [form] = Form.useForm();

	return (
		<Form
			form={form}
			name="dynamic_form_nest_item"
			onFinish={onFinish}
			autoComplete="off"
			layout="horizontal"
			initialValues={{
				date: moment(dateToday, "DD/MM/YYYY"),
			}}
		>
			<span ref={formRef}>
				<Row justify="space-between">
					<Col span={20}>
						<Form.Item
							name="name"
							rules={[
								{
									required: true,
									message: "Please enter customer name!",
								},
							]}
						>
							<Input
								addonBefore="Customer Name"
								size="large"
								type="text"
								placeholder="Eg. Anna Rivera"
							/>
						</Form.Item>
					</Col>
					<Col span={4}>
						<Form.Item name="date">
							<DatePicker
								style={{ width: "100%" }}
								size="large"
								format={"DD/MM/YYYY"}
							/>
						</Form.Item>
					</Col>
				</Row>
				<span className="invoiceTable">
					<Row justify="space-between" className="invoiceTableHeader">
						<Col span={4}>Drug Name</Col>
						<Col span={3}>Batch</Col>
						<Col span={2} className="invoiceNotToPrint">
							Ava. Qty.
						</Col>
						<Col span={3}>MFG Date</Col>
						<Col span={3}>EXP Date</Col>
						<Col span={2}>Qty</Col>
						<Col span={3}>MRP</Col>
						<Col span={3}>Total</Col>
						<Col
							span={1}
							style={{
								textAlign: "center",
							}}
							className="invoiceNotToPrint"
						>
							#
						</Col>
					</Row>
				</span>

				<Form.List name="drugs">
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Row
									key={key}
									justify="space-between"
									style={{
										display: "flex",
										marginBottom: 8,
										alignItems: "baseline",
									}}
								>
									<Col span={4}>
										<Form.Item
											{...restField}
											name={[name, "product"]}
											rules={[
												{
													required: true,
													message: "Missing Drug",
												},
											]}
											style={{ width: "100%" }}
										>
											<Select
												showSearch
												placeholder="Select Drug"
												optionFilterProp="children"
												options={productsOptions}
												filterOption={(input, option) =>
													option.label
														.toLowerCase()
														.indexOf(
															input.toLowerCase()
														) >= 0
												}
												onChange={(value) =>
													productChangeHandler(
														value,
														restField.fieldKey
													)
												}
											></Select>
										</Form.Item>
									</Col>
									<Col span={3}>
										<Form.Item
											{...restField}
											name={[name, "batch"]}
											rules={[
												{
													required: true,
													message: "Missing Batch",
												},
											]}
										>
											<Select
												showSearch
												placeholder="Select Batch"
												optionFilterProp="children"
												options={
													stocks[restField.fieldKey]
														?.stocksOptions || []
												}
												filterOption={(input, option) =>
													option.label
														.toLowerCase()
														.indexOf(
															input.toLowerCase()
														) >= 0
												}
												onChange={(value) => {
													batchChangeHandler(
														value,
														restField.fieldKey
													);
												}}
											></Select>
										</Form.Item>
									</Col>
									<Col span={2} className="invoiceNotToPrint">
										<Input
											style={{ color: "#000" }}
											type="number"
											disabled
											value={
												stockDetails[restField.fieldKey]
													?.quantity
													? stockDetails[
															restField.fieldKey
													  ]?.quantity
													: 0
											}
										/>
									</Col>
									<Col span={3}>
										<Input
											style={{ color: "#000" }}
											type="text"
											disabled
											value={
												stockDetails[restField.fieldKey]
													?.mfgDate
													? stockDetails[
															restField.fieldKey
													  ]?.mfgDate
													: "DD/MM/YYYY"
											}
										/>
									</Col>
									<Col span={3}>
										<Input
											style={{ color: "#000" }}
											type="text"
											disabled
											value={
												stockDetails[restField.fieldKey]
													?.expDate
													? stockDetails[
															restField.fieldKey
													  ]?.expDate
													: "DD/MM/YYYY"
											}
										/>
									</Col>
									<Col span={2}>
										<Form.Item
											{...restField}
											name={[name, "quantity"]}
											rules={[
												{
													required: true,
													message: "Missing Quantity",
												},
												{
													validator(_, value) {
														if (
															!value ||
															value
																.toString()
																.includes(
																	"."
																) ||
															value === "0" ||
															value < 0 ||
															+value >
																stockDetails[
																	restField
																		.fieldKey
																]?.quantity
														) {
															return Promise.reject(
																"Invalid Qty!"
															);
														}
														return Promise.resolve();
													},
												},
											]}
										>
											<Input
												placeholder="Quantity"
												type="number"
												min={1}
												disabled={
													stockDetails[
														restField.fieldKey
													]?.quantity
														? false
														: true
												}
												onChange={(event) => {
													quantityChangeHandler(
														event,
														restField.fieldKey
													);
												}}
											/>
										</Form.Item>
									</Col>
									<Col span={3}>
										<Input
											style={{ color: "#000" }}
											type="text"
											disabled
											value={
												stockDetails[restField.fieldKey]
													?.price
													? stockDetails[
															restField.fieldKey
													  ]?.price
													: "00.00"
											}
										/>
									</Col>
									<Col span={3}>
										<Input
											style={{ color: "#000" }}
											type="number"
											disabled
											value={
												stockDetails[restField.fieldKey]
													?.total
													? stockDetails[
															restField.fieldKey
													  ]?.total
													: 0
											}
										/>
									</Col>
									<Col span={1} className="invoiceNotToPrint">
										<MinusCircleOutlined
											style={{
												display: "flex",
												justifyContent: "center",
											}}
											onClick={() => remove(name)}
										/>
									</Col>
								</Row>
							))}
							{x && (
								<Form.Item>
									<Button
										className="invoiceNotToPrint"
										type="dashed"
										onClick={() => add()}
										block
										icon={<PlusOutlined />}
									>
										Add Item
									</Button>
								</Form.Item>
							)}
						</>
					)}
				</Form.List>
				<Row>
					<Col span={4} offset={20} style={{ marginBottom: "1rem" }}>
						<Input
							style={{ color: "#000" }}
							addonBefore="Grand Total"
							size="large"
							type="text"
							disabled
							value={grandTotal}
						/>
					</Col>
				</Row>
				<Form.Item>
					<Col
						span={4}
						offset={20}
						style={{ marginBottom: "1rem" }}
						className="invoiceNotToPrint"
					>
						<ButtonB
							variant="success"
							type="submit"
							style={{ width: "100%" }}
							disabled={isSaved}
						>
							Save
						</ButtonB>
					</Col>
					<Col
						span={4}
						offset={20}
						style={{ marginBottom: "1rem" }}
						className="invoiceNotToPrint"
					>
						<ButtonB
							className="invoiceNotToPrint"
							variant="secondary"
							style={{ width: "100%" }}
							disabled={!isSaved}
							onClick={printHandler}
						>
							Print
						</ButtonB>
					</Col>
				</Form.Item>
			</span>
		</Form>
	);
};

export default InvoiceTable;
