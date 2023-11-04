import Yup from "yup";
const formSchema = Yup.object({
  username: Yup.string()
    .required("Username required")
    .min(2, "Username too short")
    .max(28, "Username too long!"),
  password: Yup.string()
    .required("Password required")
    .min(6, "Password too short")
    .max(28, "Password too long!"),
  ime: Yup.string()
    .required("Ime required")
    .min(2, "Ime too short")
    .max(30, "Ime too long!"),
  prezime: Yup.string()
    .required("Prezime required")
    .min(2, "Prezime too short")
    .max(30, "Prezime too long!"),
  mail: Yup.string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
});
const validateForm = (req, res) => {
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

export default validateForm;
