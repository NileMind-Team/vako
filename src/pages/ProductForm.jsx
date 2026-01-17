import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaUpload,
  FaClock,
  FaFire,
  FaSlidersH,
  FaDollarSign,
  FaImage,
  FaLink,
  FaDownload,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../api/axiosInstance";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.productId;
  const productId = location.state?.productId;

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    Name: "",
    CategoryId: 1,
    BasePrice: "",
    Image: "",
    Description: "",
    IsActive: true,
    ShowInSlider: false,
    Calories: "",
    PreparationTimeStart: "",
    PreparationTimeEnd: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const translateErrorMessage = (errorData) => {
    if (!errorData) return "حدث خطأ غير معروف";

    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages = [];

      Object.keys(errorData.errors).forEach((key) => {
        errorData.errors[key].forEach((msg) => {
          if (msg.includes("required")) {
            errorMessages.push(`${key} مطلوب`);
          } else if (msg.includes("greater than 0")) {
            errorMessages.push(`${key} يجب أن يكون أكبر من صفر`);
          } else if (msg.includes("invalid")) {
            errorMessages.push(`${key} غير صالح`);
          } else {
            errorMessages.push(msg);
          }
        });
      });

      if (errorMessages.length > 0) {
        return errorMessages.join("، ");
      }
    }

    if (typeof errorData.message === "string") {
      const msg = errorData.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        return "بيانات غير صحيحة";
      }
      if (msg.includes("network") || msg.includes("internet")) {
        return "يرجى التحقق من اتصالك بالإنترنت";
      }
      if (msg.includes("timeout") || msg.includes("time out")) {
        return "انتهت المهلة، يرجى المحاولة مرة أخرى";
      }
      return errorData.message;
    }

    return "حدث خطأ غير متوقع";
  };

  const showErrorAlert = (title, message) => {
    const translatedMessage = translateErrorMessage(message);

    if (window.innerWidth < 768) {
      toast.error(translatedMessage || title, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "8px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
        },
      });
    } else {
      Swal.fire({
        title: title || "حدث خطأ",
        text: translatedMessage,
        icon: "error",
        confirmButtonText: "حاول مرة أخرى",
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const showSuccessAlert = (title, message) => {
    if (window.innerWidth < 768) {
      toast.success(message || title, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          width: "70%",
          margin: "10px",
          borderRadius: "8px",
          textAlign: "right",
          fontSize: "14px",
          direction: "rtl",
        },
      });
    } else {
      Swal.fire({
        title: title || "تم بنجاح",
        text: message,
        icon: "success",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const downloadImageFromUrl = async (url) => {
    if (!url || !isValidUrl(url)) {
      Swal.fire({
        icon: "error",
        title: "رابط غير صالح",
        text: "الرجاء إدخال رابط صحيح للصورة",
        confirmButtonColor: "#FB070F",
      });
      return null;
    }

    setIsDownloadingImage(true);
    try {
      const response = await fetch(url, {
        mode: "cors",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("الرابط لا يشير إلى صورة صالحة");
      }

      const blob = await response.blob();

      const maxSize = 5 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error(
          `حجم الصورة (${formatBytes(blob.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
      }

      const mimeType = blob.type;
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        const fileType = mimeType.split("/")[1] || "غير معروف";
        throw new Error(
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
      }

      const extension = getExtensionFromMimeType(mimeType);
      const filename = `image-${Date.now()}.${extension}`;

      const file = new File([blob], filename, { type: mimeType });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          Image: reader.result,
        });
      };
      reader.readAsDataURL(file);

      setImageFile(file);
      setHasImageChanged(true);
      setImageUrl("");

      showSuccessAlert(
        "تم تحميل الصورة!",
        `تم تحميل الصورة بنجاح (${formatBytes(file.size)})`,
      );

      return file;
    } catch (error) {
      console.error("Error downloading image:", error);
      showErrorAlert(
        "خطأ في تحميل الصورة",
        error.message || "فشل في تحميل الصورة من الرابط المقدم",
      );
      return null;
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const getExtensionFromMimeType = (mimeType) => {
    const mimeToExt = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/jfif": "jfif",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/webp": "webp",
    };
    return mimeToExt[mimeType.toLowerCase()] || "jpg";
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return;

      try {
        setIsLoadingProduct(true);
        const response = await axiosInstance.get(
          `/api/MenuItems/Get/${productId}`,
        );
        const product = response.data;

        const initialData = {
          Name: product.name || "",
          CategoryId: product.category?.id || 1,
          BasePrice: product.basePrice || "",
          Image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "",
          Description: product.description || "",
          IsActive: product.isActive !== undefined ? product.isActive : true,
          ShowInSlider:
            product.showInSlider !== undefined ? product.showInSlider : false,
          Calories: product.calories || "",
          PreparationTimeStart: product.preparationTimeStart || "",
          PreparationTimeEnd: product.preparationTimeEnd || "",
        };

        setFormData(initialData);
        setInitialFormData(initialData);

        if (product.imageUrl) {
          const imageUrl = `https://restaurant-template.runasp.net/${product.imageUrl}`;
          setImagePreview(imageUrl);
          setImageInputMode("url");
          setImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        showErrorAlert("خطأ", "فشل في تحميل بيانات المنتج");
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, productId]);

  useEffect(() => {
    if (!isEditing) {
      setHasChanges(true);
      return;
    }

    if (!initialFormData) return;

    const formDataChanged =
      formData.Name !== initialFormData.Name ||
      formData.CategoryId !== initialFormData.CategoryId ||
      formData.BasePrice !== initialFormData.BasePrice ||
      formData.Description !== initialFormData.Description ||
      formData.IsActive !== initialFormData.IsActive ||
      formData.ShowInSlider !== initialFormData.ShowInSlider ||
      formData.Calories !== initialFormData.Calories ||
      formData.PreparationTimeStart !== initialFormData.PreparationTimeStart ||
      formData.PreparationTimeEnd !== initialFormData.PreparationTimeEnd ||
      hasImageChanged;

    setHasChanges(formDataChanged);
  }, [formData, initialFormData, hasImageChanged, isEditing]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showErrorAlert("خطأ", "فشل في تحميل الفئات");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePreparationTimeChange = (e) => {
    const { name, value } = e.target;

    if (value === "" || parseFloat(value) >= 0) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showErrorAlert(
          "حجم الملف كبير",
          `حجم الصورة (${formatBytes(file.size)}) يتجاوز الحد الأقصى (5MB)`,
        );
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/jfif",
        "image/heic",
        "image/heif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        const fileType = file.type.split("/")[1] || "غير معروف";
        showErrorAlert(
          "نوع ملف غير مدعوم",
          `صيغة الملف (${fileType}) غير مدعومة. الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC, WebP`,
        );
        return;
      }

      setHasImageChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          Image: reader.result,
        });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleUploadAreaClick = () => {
    if (imageInputMode === "upload") {
      document.getElementById("file-input").click();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview("");
    setFormData({ ...formData, Image: "" });
    setImageFile(null);
    setImageUrl("");
    setHasImageChanged(true);
  };

  const handleDownloadFromUrl = async () => {
    if (!imageUrl.trim()) {
      Swal.fire({
        icon: "error",
        title: "رابط فارغ",
        text: "الرجاء إدخال رابط الصورة أولاً",
        confirmButtonColor: "#FB070F",
      });
      return;
    }

    await downloadImageFromUrl(imageUrl);
  };

  const isFormValid = () => {
    return (
      formData.Name &&
      formData.CategoryId &&
      formData.BasePrice &&
      formData.Description &&
      formData.Image
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.Name ||
      !formData.CategoryId ||
      !formData.Description ||
      (!isEditing && !formData.Image)
    ) {
      showErrorAlert("معلومات ناقصة", "يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    if (!formData.BasePrice) {
      showErrorAlert("معلومات ناقصة", "يرجى إدخال السعر");
      setIsLoading(false);
      return;
    }

    if (parseFloat(formData.BasePrice) <= 0) {
      showErrorAlert("خطأ في السعر", "السعر يجب أن يكون أكبر من صفر");
      setIsLoading(false);
      return;
    }

    if (
      formData.PreparationTimeStart &&
      formData.PreparationTimeEnd &&
      parseInt(formData.PreparationTimeStart) >=
        parseInt(formData.PreparationTimeEnd)
    ) {
      showErrorAlert(
        "وقت تحضير غير صحيح",
        "وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت التحضير",
      );
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.Name);
      formDataToSend.append("Description", formData.Description);
      formDataToSend.append(
        "BasePrice",
        parseFloat(formData.BasePrice).toString(),
      );
      formDataToSend.append("CategoryId", formData.CategoryId.toString());
      formDataToSend.append("IsActive", formData.IsActive.toString());
      formDataToSend.append("ShowInSlider", formData.ShowInSlider.toString());

      if (formData.Calories) {
        formDataToSend.append("Calories", formData.Calories.toString());
      }

      if (formData.PreparationTimeStart) {
        formDataToSend.append(
          "PreparationTimeStart",
          formData.PreparationTimeStart.toString(),
        );
      }

      if (formData.PreparationTimeEnd) {
        formDataToSend.append(
          "PreparationTimeEnd",
          formData.PreparationTimeEnd.toString(),
        );
      }

      if (isEditing) {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (formData.Image && !hasImageChanged) {
          try {
            const response = await fetch(formData.Image);
            const blob = await response.blob();
            const filename =
              formData.Image.split("/").pop() || "product-image.jpg";
            formDataToSend.append("Image", blob, filename);
          } catch (error) {
            console.error("Error converting old image URL to file:", error);
            showErrorAlert(
              "خطأ في الصورة",
              "فشل في تحميل الصورة القديمة. يرجى إعادة رفع الصورة.",
            );
            setIsLoading(false);
            return;
          }
        } else if (!formData.Image) {
          formDataToSend.append("Image", "");
        }
      } else {
        if (imageFile) {
          formDataToSend.append("Image", imageFile);
        } else if (imageInputMode === "url" && !imageFile) {
          const file = await downloadImageFromUrl(imageUrl);
          if (file) {
            formDataToSend.append("Image", file);
          } else {
            showErrorAlert(
              "خطأ في الصورة",
              "يرجى تحميل الصورة من الرابط أولاً أو استخدام صورة أخرى",
            );
            setIsLoading(false);
            return;
          }
        }
      }

      const endpoint = isEditing
        ? `/api/MenuItems/Update/${productId}`
        : "/api/MenuItems/Add";

      const response = await axiosInstance({
        method: isEditing ? "PUT" : "POST",
        url: endpoint,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 204) {
        showSuccessAlert(
          isEditing ? "تم تحديث المنتج!" : "تم إضافة المنتج!",
          `${formData.Name} تم ${isEditing ? "تحديثه" : "إضافته"} بنجاح`,
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showErrorAlert("خطأ", "فشل في حفظ المنتج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff5f5] to-[#ffebeb] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FB070F]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff5f5] to-[#ffebeb] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-8 xs:-left-10 sm:-left-20 -top-8 xs:-top-10 sm:-top-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FB070F]/10 to-[#ff4d4d]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-8 xs:-right-10 sm:-right-20 -bottom-8 xs:-bottom-10 sm:-bottom-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#ff4d4d]/10 to-[#FB070F]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-6xl xl:max-w-5xl mx-auto bg-white/90 backdrop-blur-xl shadow-lg xs:shadow-xl sm:shadow-2xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
      >
        <div className="relative h-28 xs:h-32 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-3 xs:-top-4 sm:-top-6 -right-3 xs:-right-4 sm:-right-6 w-12 h-12 xs:w-16 xs:h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-3 xs:-bottom-4 sm:-bottom-6 -left-3 xs:-left-4 sm:-left-6 w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-2 xs:top-3 sm:top-6 left-2 xs:left-3 sm:left-6 z-50 bg-white/80 backdrop-blur-md hover:bg-[#FB070F] hover:text-white rounded-full p-1.5 xs:p-2 sm:p-3 text-[#FB070F] border border-[#FB070F]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#FB070F]"
          >
            <FaArrowLeft
              size={12}
              className="xs:size-3 sm:size-4 group-hover:scale-110 transition-transform"
            />
          </motion.button>

          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-1.5 xs:mb-2 sm:mb-3"
            >
              <div className="p-1.5 xs:p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl">
                <FaClock className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-2xl mb-1.5 xs:mb-2 sm:mb-3"
            >
              {isEditing
                ? "قم بتحديث معلومات المنتج"
                : "قم بإنشاء عنصر قائمة جديد"}
            </motion.p>
          </div>
        </div>

        <div className="relative px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 pb-3 xs:pb-4 sm:pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 xs:mt-5 sm:mt-6 md:mt-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 xs:space-y-5 sm:space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        اسم المنتج *
                      </label>
                      <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="اسم المنتج"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        الفئة *
                      </label>
                      {isLoadingCategories ? (
                        <div className="text-center py-4 text-gray-500">
                          جاري تحميل الفئات...
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-3">
                          {categories
                            .filter((category) => category.isActive)
                            .map((category) => (
                              <motion.button
                                key={category.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    CategoryId: category.id,
                                  })
                                }
                                className={`flex flex-col items-center gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                                  formData.CategoryId === category.id
                                    ? "border-[#FB070F] bg-gradient-to-r from-[#fff5f5] to-[#ffebeb] text-[#FB070F] dark:from-gray-600 dark:to-gray-500"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                                }`}
                              >
                                <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center leading-tight">
                                  {category.name}
                                </span>
                              </motion.button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        السعر (جنيه) *
                      </label>
                      <div className="relative group">
                        <FaDollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FB070F] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="number"
                          name="BasePrice"
                          value={formData.BasePrice}
                          onChange={handleNumberInputChange}
                          step="0.01"
                          min="0.01"
                          onWheel={(e) => e.target.blur()}
                          className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-10"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        السعرات الحرارية
                      </label>
                      <div className="relative group">
                        <FaFire className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FB070F] text-sm transition-all duration-300 group-focus-within:scale-110" />
                        <input
                          type="number"
                          name="Calories"
                          value={formData.Calories}
                          onChange={handleNumberInputChange}
                          min="0"
                          onWheel={(e) => e.target.blur()}
                          className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-10"
                          placeholder="عدد السعرات الحرارية"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        وقت التحضير (بالدقائق)
                      </label>
                      <div className="grid grid-cols-2 gap-2 xs:gap-3">
                        <div className="relative group">
                          <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FB070F] text-xs transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="number"
                            name="PreparationTimeStart"
                            value={formData.PreparationTimeStart}
                            onChange={handlePreparationTimeChange}
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-8"
                            placeholder="من"
                          />
                        </div>
                        <div className="relative group">
                          <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FB070F] text-xs transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="number"
                            name="PreparationTimeEnd"
                            value={formData.PreparationTimeEnd}
                            onChange={handlePreparationTimeChange}
                            min="0"
                            onWheel={(e) => e.target.blur()}
                            className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white pr-8"
                            placeholder="إلى"
                          />
                        </div>
                      </div>
                      {formData.PreparationTimeStart &&
                        formData.PreparationTimeEnd &&
                        parseInt(formData.PreparationTimeStart) >=
                          parseInt(formData.PreparationTimeEnd) && (
                          <p className="text-red-500 text-xs mt-1">
                            وقت البدء يجب أن يكون أقل من وقت الانتهاء في وقت
                            التحضير
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        الحالة *
                      </label>
                      <div className="flex gap-3 bg-gray-50/80 dark:bg-gray-600/80 rounded-lg p-2 xs:p-3 border border-gray-200 dark:border-gray-500">
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#FB070F]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="IsActive"
                              checked={formData.IsActive === true}
                              onChange={() =>
                                setFormData({ ...formData, IsActive: true })
                              }
                              className="sr-only"
                              required
                            />
                            <div
                              className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.IsActive === true
                                  ? "border-[#FB070F] bg-[#FB070F]"
                                  : "border-gray-400 bg-white dark:bg-gray-500"
                              }`}
                            >
                              {formData.IsActive === true && (
                                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                            نشط
                          </span>
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#FB070F]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="IsActive"
                              checked={formData.IsActive === false}
                              onChange={() =>
                                setFormData({ ...formData, IsActive: false })
                              }
                              className="sr-only"
                              required
                            />
                            <div
                              className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.IsActive === false
                                  ? "border-[#FB070F] bg-[#FB070F]"
                                  : "border-gray-400 bg-white dark:bg-gray-500"
                              }`}
                            >
                              {formData.IsActive === false && (
                                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                            غير نشط
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* حقل ShowInSlider الجديد */}
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        عرض في السلايدر
                      </label>
                      <div className="flex gap-3 bg-gray-50/80 dark:bg-gray-600/80 rounded-lg p-2 xs:p-3 border border-gray-200 dark:border-gray-500">
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#FB070F]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="ShowInSlider"
                              checked={formData.ShowInSlider === true}
                              onChange={() =>
                                setFormData({ ...formData, ShowInSlider: true })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.ShowInSlider === true
                                  ? "border-[#FB070F] bg-[#FB070F]"
                                  : "border-gray-400 bg-white dark:bg-gray-500"
                              }`}
                            >
                              {formData.ShowInSlider === true && (
                                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaSlidersH className="text-[#FB070F] text-xs xs:text-sm" />
                            <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                              عرض
                            </span>
                          </div>
                        </label>
                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-2 xs:p-3 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-[#FB070F]/30">
                          <div className="relative">
                            <input
                              type="radio"
                              name="ShowInSlider"
                              checked={formData.ShowInSlider === false}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  ShowInSlider: false,
                                })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formData.ShowInSlider === false
                                  ? "border-[#FB070F] bg-[#FB070F]"
                                  : "border-gray-400 bg-white dark:bg-gray-500"
                              }`}
                            >
                              {formData.ShowInSlider === false && (
                                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaTimes className="text-gray-500 text-xs xs:text-sm" />
                            <span className="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                              إخفاء
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        صورة المنتج *
                      </label>

                      {/* Switch between upload modes */}
                      <div className="flex gap-2 mb-3 xs:mb-4">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setImageInputMode("upload")}
                          className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 rounded-lg border-2 transition-all duration-200 ${
                            imageInputMode === "upload"
                              ? "border-[#FB070F] bg-white text-[#FB070F] shadow-md dark:bg-gray-600"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                          }`}
                        >
                          <FaUpload className="text-xs xs:text-sm" />
                          <span className="text-xs xs:text-sm font-medium">
                            رفع صورة
                          </span>
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setImageInputMode("url")}
                          className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 p-2 xs:p-2.5 rounded-lg border-2 transition-all duration-200 ${
                            imageInputMode === "url"
                              ? "border-[#FB070F] bg-white text-[#FB070F] shadow-md dark:bg-gray-600"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400"
                          }`}
                        >
                          <FaLink className="text-xs xs:text-sm" />
                          <span className="text-xs xs:text-sm font-medium">
                            رابط صورة
                          </span>
                        </motion.button>
                      </div>

                      {imageInputMode === "upload" ? (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 text-center hover:border-[#FB070F] transition-colors duration-200 cursor-pointer dark:border-gray-600"
                          onClick={handleUploadAreaClick}
                        >
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 xs:h-56 sm:h-64 md:h-96 object-contain rounded-lg mb-2 xs:mb-3"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-1 xs:top-2 left-1 xs:left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              >
                                <FaTimes size={10} className="xs:size-2" />
                              </button>
                            </div>
                          ) : (
                            <div className="py-8 xs:py-10 sm:py-12 md:py-16">
                              <FaUpload className="mx-auto text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                              <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base">
                                انقر لرفع الصورة
                              </p>
                              <p className="text-gray-500 dark:text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                                الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC,
                                WebP (الحد الأقصى 5MB)
                              </p>
                            </div>
                          )}
                          <input
                            id="file-input"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/jfif,image/heic,image/heif,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            required={!isEditing && imageInputMode === "upload"}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3 xs:space-y-4">
                          <div className="border-2 border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 dark:border-gray-600">
                            <div className="mb-3 xs:mb-4">
                              <label className="block text-xs xs:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-2">
                                رابط الصورة
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={imageUrl}
                                  onChange={(e) => setImageUrl(e.target.value)}
                                  placeholder="أدخل رابط الصورة"
                                  className="flex-1 border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                />
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleDownloadFromUrl}
                                  disabled={
                                    isDownloadingImage || !imageUrl.trim()
                                  }
                                  className={`px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm ${
                                    imageUrl.trim() && !isDownloadingImage
                                      ? "bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] text-white hover:shadow-xl hover:shadow-[#FB070F]/25 cursor-pointer"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {isDownloadingImage ? (
                                    <>
                                      <div className="animate-spin h-3 w-3 xs:h-4 xs:w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                      <span>جاري التحميل...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaDownload className="xs:size-3" />
                                      <span>تحميل</span>
                                    </>
                                  )}
                                </motion.button>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-[10px] xs:text-xs mt-2">
                                الصيغ المدعومة: JPG, JPEG, PNG, JFIF, HEIF/HEIC,
                                WebP (الحد الأقصى 5MB)
                              </p>
                            </div>

                            {imagePreview ? (
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-48 xs:h-56 sm:h-64 object-contain rounded-lg mb-2 xs:mb-3"
                                />
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-1 xs:top-2 left-1 xs:left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <FaTimes size={10} className="xs:size-2" />
                                </button>
                              </div>
                            ) : (
                              <div className="py-6 xs:py-8 sm:py-10 text-center">
                                <FaImage className="mx-auto text-3xl xs:text-4xl sm:text-5xl text-gray-400 dark:text-gray-500 mb-2 xs:mb-3 sm:mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 mb-1.5 xs:mb-2 sm:mb-3 text-xs xs:text-sm">
                                  سيظهر معاينة الصورة هنا بعد التحميل
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 mb-1 xs:mb-1.5 sm:mb-2">
                        الوصف *
                      </label>
                      <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border border-gray-200 bg-white text-black rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#FB070F] focus:border-transparent transition-all duration-200 resize-none text-xs sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="قم بوصف المنتج بالتفصيل..."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="flex-1 py-2 xs:py-2.5 sm:py-3 border-2 border-[#FB070F] text-[#FB070F] rounded-lg font-semibold hover:bg-[#FB070F] hover:text-white transition-all duration-300 text-xs xs:text-sm sm:text-base flex items-center justify-center gap-1.5 xs:gap-2 dark:border-[#FB070F] dark:text-[#FB070F] dark:hover:bg-[#FB070F] dark:hover:text-white"
                  >
                    <FaTimes size={12} className="xs:size-3 sm:size-4" />
                    إلغاء
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      !isFormValid() || isLoading || (isEditing && !hasChanges)
                    }
                    className={`flex-1 py-2 xs:py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base ${
                      isFormValid() && !isLoading && (!isEditing || hasChanges)
                        ? "bg-gradient-to-r from-[#FB070F] to-[#ff4d4d] text-white hover:shadow-xl hover:shadow-[#FB070F]/25 cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <FaSave size={12} className="xs:size-3 sm:size-4" />
                    {isLoading
                      ? "جاري الحفظ..."
                      : isEditing
                        ? "تحديث المنتج"
                        : "حفظ المنتج"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductForm;
