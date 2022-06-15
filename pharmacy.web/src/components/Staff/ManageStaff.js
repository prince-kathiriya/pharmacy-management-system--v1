import { Table, Input, Button, Space, Popconfirm, Modal, Col } from "antd";
import Highlighter from "react-highlight-words";
import {
	EditFilled,
	SearchOutlined,
	DeleteFilled,
	SyncOutlined,
} from "@ant-design/icons";
import CardTable from "../UI/CardTable";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UpdateStaff from "./UpdateStaff";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const ManageStaff = () => {
	const { role } = useSelector((state) => state.auth);
	const [data, setData] = useState([]);
	const navigate = useNavigate();
	const getData = async () => {
		try {
			const staffData = await axios.get("/api/v1/users");
			setData([...staffData.data.users]);
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
	useEffect(() => {
		getData();
	}, []);
	const [searchCriteria, setSearchCriteria] = useState({
		searchText: "",
		searchedColumn: "",
	});

	const searchInput = useRef();

	const { searchText, searchedColumn } = searchCriteria;

	const handleSearch = (selectedKeys, confirm, dataIndex) => {
		confirm();
		setSearchCriteria({
			searchText: selectedKeys[0],
			searchedColumn: dataIndex,
		});
	};

	const handleReset = (clearFilters) => {
		clearFilters();
		setSearchCriteria({ ...searchCriteria, searchText: "" });
	};

	const getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() =>
						handleSearch(selectedKeys, confirm, dataIndex)
					}
					style={{ marginBottom: 8, display: "block" }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() =>
							handleSearch(selectedKeys, confirm, dataIndex)
						}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
					<Button
						type="link"
						size="small"
						onClick={() => {
							confirm({ closeDropdown: false });
							setSearchCriteria({
								searchText: selectedKeys[0],
								searchedColumn: dataIndex,
							});
						}}
					>
						Filter
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined
				style={{ color: filtered ? "#1890ff" : undefined }}
			/>
		),
		onFilter: (value, record) =>
			record[dataIndex]
				? record[dataIndex]
						.toString()
						.toLowerCase()
						.includes(value.toLowerCase())
				: "",
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.select(), 100);
			}
		},
		render: (text) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text ? text.toString() : ""}
				/>
			) : (
				text
			),
	});

	const [showStaffUpdateForm, setShowStaffUpdateForm] = useState(false);
	const [staffDetails, setStaffDetails] = useState({
		id: "",
		name: "",
		email: "",
		mobile: "",
		password: "",
	});
	const deleteSupplierHandler = async (staffId) => {
		try {
			await axios.delete(`/api/v1/users/${staffId}`);
			getData();
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
	const editStaffHandler = async (staffId) => {
		const responseData = await axios.get(`/api/v1/users/${staffId}`);
		// console.log(responseData.data);
		const {
			name,
			email,
			mobile,
			_id: id,
			password,
		} = responseData.data.user;
		setStaffDetails({
			id,
			name,
			email,
			mobile,
			password,
		});
		setShowStaffUpdateForm(true);
	};
	const closeModalHandler = () => {
		getData();
		setShowStaffUpdateForm(false);
	};
	const clearFilerHandler = () => {
		navigate(0);
	};

	const adminColumns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "30%",
			...getColumnSearchProps("name"),
		},
		{
			title: "Mobile Number",
			dataIndex: "mobile",
			key: "mobile",
			width: "30%",
			...getColumnSearchProps("mobile"),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			width: "40%",
			...getColumnSearchProps("email"),
		},
		{
			title: "Actions",
			dataIndex: "action",
			key: "action",
			render: (text, record) => (
				<Space
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					size="large"
				>
					<EditFilled
						key={record._id}
						style={{ fontSize: "1rem" }}
						onClick={() => editStaffHandler(record._id)}
					/>
					<Popconfirm
						placement="leftBottom"
						title={"Are you sure?"}
						onConfirm={() => deleteSupplierHandler(record._id)}
						okText="Yes"
						cancelText="No"
					>
						<DeleteFilled style={{ fontSize: "1rem" }} />
					</Popconfirm>
				</Space>
			),
		},
	];
	const staffColumns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "30%",
			...getColumnSearchProps("name"),
		},
		{
			title: "Mobile Number",
			dataIndex: "mobile",
			key: "mobile",
			width: "30%",
			...getColumnSearchProps("mobile"),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			width: "40%",
			...getColumnSearchProps("email"),
		},
	];
	// console.log(data);
	return (
		<>
			<UpdateStaff
				staffDetails={staffDetails}
				show={showStaffUpdateForm}
				onClose={closeModalHandler}
			/>
			<CardTable>
				<Col>
					<SyncOutlined
						onClick={clearFilerHandler}
						style={{
							fontSize: "2rem",
							margin: "0 1rem 1rem 0",
							display: "flex",
							justifyContent: "end",
						}}
					/>
				</Col>
				<Table
					columns={role === "admin" ? adminColumns : staffColumns}
					dataSource={data.map((x, ind) => {
						return { ...x, key: ind };
					})}
				/>
			</CardTable>
		</>
	);
};

export default ManageStaff;
