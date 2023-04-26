const Yup = require("yup");
const formSchema = Yup.object({
  username: Yup.string()
    .required("Username required")
    .min(2, "Username too short")
    .max(28, "Username too long!"),
  password: Yup.string()
    .required("Password required")
    .min(6, "Password too short")
    .max(28, "Password too long!"),
});
const validateFormLogin = (req, res) => {
  const formData = req.body;
  formSchema
    .validate(formData)
    .catch((err) => {
      res.status(422).send();
      console.log(err.errors);
    })
    .then((valid) => {
      if (valid) {
        console.log("Login Successful");
      }
    });
};

module.exports = validateFormLogin;
