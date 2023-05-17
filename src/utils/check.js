import { accountRegex, passwordRegex, nameRegex } from "./regex";

// 帐号是否合法(长度4-16,字母开头,允许字母数字下划线)
const checkAccount = (name) => {
	return /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(name);
};

// 密码(长度6-18,以字母开头,允许含字母、数字和下划线)
const checkPassword = (password) => {
	return /^[a-zA-Z]\w{5,17}$/.test(password);
};

// 姓名(长度2-9,允许包含汉字、字母、数字和下划线)
const checkName = (name) => {
	return /^[\u4E00-\u9FA5A-Za-z0-9_]{2,8}$/.test(name);
};

export { checkAccount, checkPassword, checkName };
