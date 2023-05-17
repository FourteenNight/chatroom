import { h } from "vue";
import { Modal, Button, Input } from "@arco-design/web-vue";
import { roomUpdate, roomAdd, roomDel } from "../api";

const ModalInput = {
	setup() {
		return () => h("div", null, [h(Input, { id: "modal-input" }, null)]);
	},
};

const ModalContent = (item, user, callback) => {
	const modal = {
		setup() {
			const revise = () => {
				Modal.info({
					title: "频道名称修改",
					content: () => h(ModalInput),
					hideCancel: false,
					onOk: () => {
						const value = document.querySelector("#modal-input > input").value;
						console.log(value);
						if (value ) {
							roomUpdate({ id: item.id, name: value, user: user })
								.then((resp) => {
									callback(resp);
								})
								.catch((error) => {
									console.error(error);
									callback(error);
								});
						}else{
							let resp = {code:400,msg:'频道名字为空'}
							callback(resp)
						}
					},
				});
			};

			const remove = () => {
				Modal.info({
					title: "删除频道",
					content: `确定删除 ${item.name} 频道吗`,
					hideCancel: false,
					onOk: () => {
						roomDel({ id: item.id })
							.then((resp) => {
								callback(resp);
							})
							.catch((error) => {
								console.error(error);
								callback(error);
							});
					},
				});
			};
			const add = () => {
				Modal.info({
					title: "添加频道",
					content: () => h(ModalInput),
					hideCancel: false,
					onOk: () => {
						const value = document.querySelector("#modal-input > input").value;
						console.log(value);
						if(value){
							roomAdd({ name: value, user: user })
								.then((resp) => {
									callback(resp);
								})
								.catch((error) => {
									console.error(error);
									callback(error);
								});
						}else{
							let resp = {code:400,msg:'频道名字为空'}
							callback(resp)
						}
					},
				});
			};
			return () =>
				h("div", { class: "info-modal-content" }, [
					h(Button, { size: "small", onClick: revise }, { default: () => "频道名称修改" }),
					h(Button, { size: "small", onClick: remove }, { default: () => "删除该频道" }),
					h(Button, { size: "small", onClick: add }, { default: () => "添加频道" }),
				]);
		},
	};
	return modal;
};

export { ModalContent };
