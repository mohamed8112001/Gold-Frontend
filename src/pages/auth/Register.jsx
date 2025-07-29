import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import {
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../utils/constants.js";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "regular";
  const navigate = useNavigate();
  const { register, isLoading, googleRegister } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider images - in a real app, these would be imported or from a CDN
  const sliderImages = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUSEhIVFRUVFxUVFhUVFRUVFRUVFRUWFhUYFRUYHSggGBslGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0lHyUtLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAAAQIDBAUGB//EADoQAAEDAgQDBgQDCAIDAAAAAAEAAhEDIQQFEjFBUWEGEyJxgZEyQqGxFFLRI2KCosHh8PFyshUz0v/EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACgRAAICAgICAgEEAwEAAAAAAAABAhEDEiExBFETQWEUInGBIzJCBf/aAAwDAQACEQMRAD8A9P7xHeKPSjSrMh/eI7xRaUaUUFEvepO8UcJNKYUS94jvFFpRpSCiXvEd4o9KNKAok7xHeKIhEIoKJe8Sa0yEkICiTWjWooKIKAol1pNaihCY6JNaNaiRCAol1o1qJCAofrSFyakQFD9SNSYUqAoWUSmoQA6UJsoQMtpClRCBDUJSkQIEmlKhBQ1CckhACIQhACIQhAAhCEAIUhTkIAahEoQAiEJSgBEhSoQA1KQiEqAGpYTkIAbCXSlhLCdANhInwhFASpSkQkSCRKkTAEIQkUISgpUQgBqEulIgAQhIgAQlSIAFSxWKgQ0jlKdmL3BhghoMNLibN1cbSR5wsoVQTNgXBroAA3HIbgWusMuSuEXGJHjM3p0iA+qGk3ALrq1hc3nYyFgZxkGFxeosd3eIYD3mo+FzWwQ72IAA5jkSudwQqYWqG1qbmtE6gZbqBB0mfO/VeX+uak0vo6o4FJHqVDFNdsbqZea5Z2qLahp4gaRPgqjYjgH8iu4o41zQNYMEAgxuDsfJeji8lSSs554mjSSptOoCJBlOXUZUEJSgJUwoSEqEICgQhKmFCJUIQFDyhCFJIBCRKmAiEqRIoEIQgAQQhCYCFJCck0oARI94aJ48P1KKjoWdjMTp6k/5JXPly1wi4xsp5g4uJaXQN5JsLb/VUm06gYC0SJky4EhrdhG9pZPn5KPF1jIJne/6K3Wl4kO1biX1GyZEQ0OcA74RyF+luOPNmpl5jhTrFds2hxiwOgiNR9gmZ7jHZg9gDWseYbBNjLhpk8ALnndS1Gd42pQd4SdhcAHdvGYMDj9SsvL8lfS8QrEuabDbSQdudl52fFzsjpxy4/ImO7LVMMdFfS9jgTzlskSfvHVabM+rOayk97arWSA4tHeQdg4ixgdL8ZWR2gzPGViBWqFwExAa3ffYeXsufOJdRuJI5AcFlByUv2v+jXTaNy7PR6GMLPGzxN4t/RbmX45lVstPmOIXn2S5kXND2bEwR18kzO81fhCMTSBIB/aM5jmOq9XxvJ/5Zx5MR6ehYvZrtFSxdIPpu33HEHqtqF6idnOCEqEwBCIQmAJUkpUAOQhCkzBCEIAEISIKFQkShACJUIQAiCQLnhw5lKqWY1tI+yjJLWLY4q2Q43FxfclZFRxNylqPkyVGSvObOhDKrZEKLCMbMvIhtxNoEmSDz2tPKOKnAVfGUrSB/UTwsp6dgXMwoim0CxJA4+KY1tbYEiGucY4kgz4b892gpYhzW1cINb5Ae0CS5tw14bNzaCBe3Qre1GoRWJdqHN0gEyDMzPhEenRI3DmjBuCXSBDvACCSHGOEAEgmLXMFXKKmtn0CerOAfnddtTRiKURZwggtP7wN5W9SyunXp6qTr8v7L06hhsNjmNNam1z2HxA2JIteNwsHtbk2GohvdNNNw/ISfKd1zZfGSW3BrHLzR58cqqUyS1pbpuSLD1VqlXp1qTqdcQ42HIq9jqjms1VC9zbAtAsXGY1H02PJYWkEBzm2JMNm4A58lwbOMuzqrZGBh2V8txGph8Djb8rhyPVey9me0FPFUw4HxcQuMy3CMxVOtTrOawNEsDjczyKb2IxbctxD6WKYDh60NbVi9Mz4TPAXvHQ8wvZ8Xyt+H2cWbHR6iAlhLUbpcG6g4EamuGzmnYoXpJ2jlYmlKAhCYJghCExioQglSZghVMTj2t3K5rMe2tBh094JmI3M+QWMs8YmkcbZ15cFG/EtG5C4ep2gL3iXljCJmIlRHN6dR+ikS8gXN/6rjf8A6EbdG/6d1bOvxWfYen8dVrfMwsqr29wIMd80naAZP0XEZ52bGIqa6hiGloHnxVbKezVHDmbOPM8FL89V+Sl49now7WUjBDXQehQ7tbREzPhBJ9FyhO3iCz8yyRla3flo4gGJ81zLz8jlTdIv4I0em5d2ly6pSZUOLptLhJa57QR0IN1hY3tPhq1buKT9RGrS7g8ASYPHifQrlcJ2Pw7KbXOeTBuSePorub0KP7OpRADqRDmkbyBETyIkR1W0vNg1TM1hdm6UgCSk8OAcOIlStahNPkKoGtT3U5snMarlCgmxGCwupVI1FoJaRESQHDnyJA9ua3MS19aprq1GFjGlzKYBa18k/FG0BzdyYJhGb5a19ODYi7TaQfXoSPUqlhzpb8pBimCXR4hEMdeQ6SIPHw7y2ag7pN8Csny6o8EMfIe4FzHXlzfi0vIJjw3kmQZkwQV0DsNg60Oc8Ne4RDnwZG40nchcZWxNnYZtOmQxwdqJNUtGljw0MuRqBPhg781Xznu65dQqHUCfC9szraIBbPzgA+EbiRG0ucYOXEbQ1a7Zb7adm8QynLSX0RLoaILSRGpw3NrTeFlZJ2fc5raT2kGA4zYwRInlYrFy/tBjsuqii+oalE3ZfUyozmwnbhIFwfSfUMm7Q4UzVDf2j4sL9LHYLi+BKddI3+SSicJmWUmk46txsOA6kKOnWp12mjVidl2mf5fra53zul3qV51WpFsx8QMjhtupn/j6HB7m1k2BqYZwLK73taI0PMgCdm8tzZd5gcUKjQR6rgMuzJtRgIILo8QE26X4rcyzG6XAjY7r0PG8lv8A2MMuKjrEJtN4IBHFOXpo5gQhCLFY5ZuOxMNc47NBPstFyyahBlh2NiDxBWGZ0qKgjy3M+0b6riXP0NBGlo4ifmVPD46kx5LWghxkiNzG6tZx2LfQqOc0a6Jkh25bfZw6c1Vp5eQ4HgvFzpJ1JnqY9a4LFXOxUAAbOmWi33TcLiqgJLQAbKduEgGBe59VknKMQ50l2npK54QhK64/kuUjXrYis906rKDuKhEF1+av4TBENDeQV+jlbipUZdIndFHuZbBN1LTw7NUxwI9VsU8lVink5QsLE5mfWy9v4edRu6Ik8Fg4mpTYQzWRtxXX9osP3WFNQXcJt9lzeGy2i1jRUe0vq3uRMq1h4J3NLs7idJLHP1Bxls8Dy8jb1HVdKxi4PKcKRVqUA6QyC0jgDNp9F32Tv1Q1/wAQ4/m6+a6cVxWrMMnLstYegtSnQDRJVihg9Ik+apupvxDtNOzAfE7/ADcrS3J0jEzcXXNR2lvw8TyVXFZACyo9lQy5mk0X3p1QNQBsJpkayNUFdM7AtaO7pgAN+N54rMxmNAsyQ3ifmceatWnwBy2VYlrC7D1HNBaILajWPe7RMaXEwfl2kHe2q9rX3bmioGODKnhkA2EeFwJk7tPC88ICO02EbjADHdvpiaZbsHD82+9xIEidiJBwsLnj9ZpYpmksgAtaAQBDhpc6bS0GWmCBw0meiM2k6CrLeLYKoIqUiaL5fIEFj9TgXsO0iDYG43uTq5w1KmAqhtQ66FQ/s6o+Gd4P5T06Hfh29Og5jCdBkh0vBfDHOtDJBhksiIJhg4RGfiqtJzdJaKlJ7ZqNeWm2oiSAZBB03AEczEqcmJa/uZcZcmhgc47xoBdI4FY2eYS+sLExOX1sDNSiXVcLu5u9WgOo+Zn7w2G+0nbwmZMrsa5pDgd1yZMbrV/0zWLp2jBwIDa2sv0t4kmw6AdVZrZyaVZpImjUsXDZp4HonU8mdWq9y0CXO0tmw9eiTMcu/Cl9CsQ5pOn4Y8iAbgfdcuObhK3/AAdEkpKjv8hxsjSfTy4LbXDdnsyq1A0VNH7NoY17LF7RtrH5vuu1w9TU0Fe742TeNHm5YUyRCELpMhyxcQy63IWBjahadpHGN1z+R0XjG+IbH0P6qjicsovu5hYfzU/02PsrlKs12xn7+ylC4ZU0bq0YtPs82fBVa7ofCR77lWKXZkgy63UzHvstOFbwOhpBLbfulzD/ACkLL44eit5FShkDLeIHyV1mUsCfXeyPiqb3nS+38Quq78TBfpqCAJaHUtMnkXMdbzhS8HqRSy+0XG5e1P8AwIWZUzGoGtINNxMy3VVBHL4pBS1cwqNPiiPzNqNcD5Q0n3Ch4J+x/KvRoV8A1zdLtljVeyWGPAfoitn5aLMc/oN/5mgfVZtTtC/hha5340f6vTWGfse8fRo4Xs3QpzoIBO54lTjLQDIqQRsbLnamcYmRGHseJLbecVN/QqN+Kxjtg1v8Q+xYT9VXxTX2LaLPSMO9tanoebtiQDEjgfJaDKYaNDBAHJeYZV37X631HEjZod4SDuCI+q6R2c1YOl1jYmAXA+a3hkS/a+zGUK5Rez3HtaO6Z/F5rnDJMlKZJk3KcAm2JIGhUc4yZmIaJ8L2/BUHxN6Hm08R6gggEaKcApTa5KORbXq0AaNYHTHhiS2BF2OAteLcNo+EnRyyi4aKjCHUnMJ5PMuaCHMNmXBsQL6uRW1iKLXDS4SPsehGx6hZj8G9hOkgt4Hj5H9R5WG+qmu2grgTD1peS2Ycf2YLhqb43giC0F0wOAA9iqIyWkX99hyKbzd7R/63yd3NHwO6ixvY7qw+jL9ezybeEmLG5cXHrsLauJupc0r06RaXOgGHS0vc7VBBBkkx4iPYKq2TYujX7K0mUHVa9azhamLHceKI47X5Fc7nWWuxP4isY0ggmo8w0EwIG0nbyHWFpnEOaJqABhEtPEwPEC28QbWJWpgswYWsGlrmMEtGwBM+I/vb3IXHkwNxSRpHJq7PNshxrqddtPUNJeGm0yPlPRerZedxuuYPZ+j+I/EXmZa2bA9TuY/yV0uXMuTw2XZ4sXGrIzyUuUX0IQvQOcmKxMSLrd0rFxbbrnz9FQM6rhGm+x5hMDKrdnB3mrSAuGUV2bJkAxTh8TD5i4U+HxjSYBvtH+k9SU3CZLWu6OaHD6hZ0/ZQVwRMgiDBngeRVKqJNlcradMaGgEyYLmz5wYVTFwXOPjlzNA8YMNIAg6mkkdJT5ERlpSFqruwo7tjAY0kky0EX/KQQfQqxVJFTvGOdaI2pcIuGS36FO2AwsSaEY/FV6jCzYHnVJ/60wfqsZ2XV/zUx5ms77vCaA2RT6fRMe4DcgeZAWJ/4aqfiqUiOQo1Qfc1yPopaWRtHzR/xp0hPnqa5PgZpjF0thUYf+Lmujz0kqLE5i1kObqPMNaSCORmPf8A0W0cvYOZ9QPo0AfRXmUQQbBc+WEpcr6Li0h2DxDardTZ6giHA9Qpw1ctjcI+jU76idLto+Vwn4XDiLn3suv7MYqjibPOh8A6dQkGAY62cP7GyeLJvx9hOGvK6G0qRcYAk8kr4Fhfmf6Ba2ZMbSmnTBmPE7iZvHQLKLFrLh0ZrkiSJzmpAixkdSgHCCLKvUwcEFvy/DJNrggyOIItMxdXUJpgZ+Lc9wEvDbnU4jUTJ2k2k2G3FR1dXdxpLiQGve0AQAfCNViTPEcz1WpAKaSJt/pbRbk+SGkiPB0iY1SLD5nOPL4ib2kzzhdBQcIgLEDlo4OouyEVEylyX4QklC1JLulY2NZcrbBWbj6UGeH2XNm5iXHsyi1M0qy5ij0Lhs2oi0p4TtKA1TYxjyqdXdXXhU6ounYEaUFJCWEAKSmkJUoSAjcEyFZgI0pWBVlT0DZP0KWk1LYdENegHCCsLG5eabhUDA7SZDhZ7T0cLxc784XSFZmcVobp57rDJBPnplxbXA7Le0Os6aw0ng4/Ceh/L9vJbJK4Vw9Fs4HFuD4pFxoj4S8XJiT6TITxbPhilXZvEJNChZigd7f5zUmpbU12JOxC1IhzwN1jYrNQ52hptxKuKsTNF9ebNPmf0StKq0aZOy0MPgyV3Y40YN2MaFp4OmijhAFcY2FshDkIQnZJdBUdROlRvKiSKTIKmEBuLdDt/ZValEjceu49x/VXgU8OXNPCmWpNGSGpdK03U2ndoPXY+4umtwDSbOLfYj63+q53gl9FKaMxzVVrU7rbqZU7cPYbxsQfuoKuV1L+FtuTj/8AKj4si+itomN3SO6WmcC8fIb7Xbfykp1PBGfG17fIMJ/7I1n6C4mV3STulr1sI2PCHk9Qwe/iUBwj/wAp92fqk4TX0GyM8U0gYtA4R3L3Lf1SfhHc2+5/RP45v6HsihoU9FtlZGD/AHv5T95U1PCN5k+sfaCmsM2G6KboG6q4rLzUHhbPU2Hnff0W9ToNbcNAPPj7m6dKuOBfbJc/RyA7Mu1Av8QBu0GARyUlTL395IbpbwbJOkcpK6oqCoFtHFFO0iLZgnDO5FRU8JWm0j1hbpplS0WQqcb7F0ZIytzh43T9U+hkzG3iTzWxoSEBNRS6BsgpUGjgrEJic0raJI8J4QELShWCEsITETqCoU8uUNQoaEmLrTg9QJQVm4lJlgVE4PVXUU4PUuIyy96rveQbHdNL1DUddCiBY791r7bTdFSsXbx6AD7KnqKXUVWoWTykUJejUlqBKhQyiSjUCWVLScqysUG2SapAPc5I26RPlSkOwLU1KXJnX/f9kUAvdpbBMNRRlyaiFkjnpqaClVKIgSoQqAmYU5QtKmBVksVIllCoQqieVMVHUagSISEIQpKCUqNKAEmgGkqGqbq06mb9N4II+ihq0zyQhMglOlCcG8kwBACc5pG4KaihhCVJKbKKCx5Kn1QIVZqe5yiSGmPD0OqKMIIQFjmmdzA+vohzvRM1IToLHBqXSgFOToLEhKkSkooLAoASC6c13A/4UJCbBTNCjphSgqkS2CEITCyRKAmKzRYgRXdQlROpkLRcAnd30SoLMlOa4jitB1AHcKGpgxwU0Oyq6qdvX181HUrX2Fx1EeUFTvw3VRvwrjsig2ITVsBHPiY9uCecSQZbLf4r+4ATXYZw4IZhnE8B1JgJ0Kx1TFuIgucRyLjCryrL8G4CZafJwJUPcu5Jr8DsjlJqUhpkbpulAWLSTglY2yU1YsLdePpy3U/Y74JW02t+MxvYXII2kKrUcSZSIVJE2IE5pTUqdBZK0pyiBTh0SKscShu9xKVrBE8UlwkFim3r9ErG8UukfqpE0KwCUJEJiHT1QmoQBI3dXaOyVCBDlPS2SIQBE7dSOQhJjKr00IQgljaijKEJgMSFIhJjRBV3S0ePkhCllLoaoqu6EIXYmNQhCsBU1CEAOapKW/v9kIUsEPTUIQCJmpUIVIAQhCABCEIA/9k=",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsqxqQGx3hTpJDlsUXKjdvqtPGM1KRlZlsKQ&s",
  ];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("auth.validation.required_field");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("auth.validation.required_field");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.validation.required_field");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.validation.invalid_email");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("auth.validation.required_field");
    } else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = t("auth.validation.invalid_phone");
    }

    if (!formData.password) {
      newErrors.password = t("auth.validation.required_field");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.validation.password_min_length");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwords_not_match");
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t("auth.validation.agree_terms_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType,
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setErrors({
        submit: error.message || t("messages.error.registration_failed"),
      });
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const getUserTypeInfo = () => {
    return userType === "seller"
      ? { title: "Shop Owner", titleAr: " صاحب متجر", icon: "🏪" }
      : { title: "Regular User", titleAr: " مستخدم عادي", icon: "👤" };
  };

  const typeInfo = getUserTypeInfo();

  return (
    <div
      className="h-screen w-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #F8F4ED 0%, #FFFFFF 50%, #F0E8DB 100%)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, rgba(163, 127, 65, 0.15) 0%, rgba(163, 127, 65, 0.1) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "linear-gradient(135deg, rgba(163, 127, 65, 0.1) 0%, rgba(163, 127, 65, 0.15) 100%)",
          }}
        ></div>
      </div>

      <div className="w-full h-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch h-full bg-white/80 backdrop-blur-sm">
          {/* Left Side - Enhanced Branding with Slider */}
          <div
            className="relative flex flex-col items-center justify-center p-12 overflow-hidden order-1 lg:order-2"
            style={{
              background:
                "linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)",
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            {/* Image Slider Container */}
            <div className="relative w-80 h-80">
              {/* Main circular container */}
              <div
                className="w-full h-full rounded-full flex items-center justify-center  relative overflow-hidden border-8 border-white/50"
                style={{
                  background:
                    "linear-gradient(135deg, #FEF7ED 0%, #FDF4E8 100%)",
                }}
              >
                {/* Slider images */}
                <div className="relative w-64 h-64 rounded-full overflow-hidden ">
                  {sliderImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Wedding Ring ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${
                        index === currentSlide
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-110"
                      }`}
                    />
                  ))}
                </div>

                {/* Floating decorative rings */}
                <div
                  className="absolute top-4 right-4 w-8 h-8 border-4 rounded-full animate-bounce delay-300"
                  style={{ borderColor: "rgba(163, 127, 65, 0.6)" }}
                ></div>
                <div
                  className="absolute bottom-6 left-6 w-6 h-6 border-3 rounded-full animate-bounce delay-700"
                  style={{ borderColor: "rgba(163, 127, 65, 0.4)" }}
                ></div>
              </div>
            </div>

            {/* Enhanced Dibla text with animation */}
            <h1
              className="text-9xl font-bold mb-8 relative"
              style={{ fontFamily: "serif", color: "#2D1810" }}
            >
              <span className="relative z-10" style={{ fontSize: "80px" }}>
                دبله
              </span>
              <div
                className="absolute inset-0 blur-lg opacity-30 animate-pulse"
                style={{
                  background:
                    "linear-gradient(90deg, #D4AF37 0%, #F4E4BC 100%)",
                }}
              ></div>
            </h1>

            {/* Enhanced subtitle */}
            <p
              className="text-3xl text-center mb-12 max-w-sm leading-relaxed font-medium"
              style={{ color: "#2D1810" }}
            >
              اختر أقرب متجر بنقرة واحدة
            </p>

            {/* Enhanced pagination dots */}
            <div className="flex justify-center space-x-3">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? "w-10 h-4"
                      : "w-4 h-4 hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentSlide
                        ? "#2D1810"
                        : "rgba(45, 24, 16, 0.4)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Enhanced Form */}
          <div className="w-full bg-gradient-to-br from-white to-[#FFF8E6] p-8 lg:p-12 flex flex-col justify-start relative overflow-y-auto order-2 lg:order-1">
            {/* Navigation */}
            <div className="flex justify-between items-center ">
              {/* مستخدم عادي + الأيقونة (يمين) */}
              <div
                className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full"
                style={{ backgroundColor: "#F5F1EB" }}
              >
                <span
                  className="text-arabic-base font-medium"
                  style={{ color: "#6B5B47" }}
                >
                  {typeInfo.titleAr}
                </span>
                <User className="w-4 h-4 mr-3" style={{ color: "#A37F41" }} />
              </div>

              {/* زر العودة (شمال) */}
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.USER_TYPE_SELECTION)}
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لنوع الحساب</span>
              </Button>
            </div>

            {/* Navigation Tabs with enhanced styling */}
            <div className="flex justify-center ">
              <div
                className="flex rounded-xl p-1 "
                style={{ backgroundColor: "#F0E8DB" }}
              >
                <div
                  className="px-8 py-3 bg-white rounded-lg font-medium  border transform scale-105"
                  style={{ color: "#A37F41", borderColor: "#E2D2B6" }}
                >
                  إنشاء حساب
                </div>
                <Link
                  to={ROUTES.LOGIN}
                  className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-white/50"
                  style={{ color: "#241C0F" }}
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>

            <div className="max-w-md mx-auto w-full">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <h2
                  className="text-heading-2xl font-bold mb-3"
                  style={{ color: "#A37F41" }}
                >
                  {t("auth.register.title")}
                </h2>
                {/* <p className="text-arabic-lg" style={{ color: "#6B5B47" }}>
                  {t("auth.register.subtitle")}
                </p> */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-label-lg font-semibold mb-2 text-primary-900 font-cairo">
                      {t("auth.register.first_name_label")}
                    </label>
                    <Input
                      name="firstName"
                      type="text"
                      placeholder={t("auth.register.first_name_placeholder")}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`py-3 border-2 rounded-xl transition-all duration-200 text-arabic-base text-primary-900 font-cairo ${
                        errors.firstName
                          ? "border-error-500"
                          : "border-secondary-2"
                      }`}
                      onFocus={(e) => (e.target.style.borderColor = "#A37F41")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5D5C3")}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-arabic-sm mt-1 animate-pulse">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label
                      className="block text-label-lg font-semibold mb-1"
                      style={{ color: "#6B5B47" }}
                    >
                      {t("auth.register.last_name_label")}
                    </label>
                    <Input
                      name="lastName"
                      type="text"
                      placeholder={t("auth.register.last_name_placeholder")}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`py-3 border-2 rounded-xl transition-all duration-200 text-arabic-base ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                      style={{
                        borderColor: errors.lastName ? "#ef4444" : "#E5D5C3",
                        color: "#6B5B47",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#A37F41")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5D5C3")}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-arabic-sm mt-1 animate-pulse">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Email Field */}
                <div className="group" dir="rtl">
                  <label
                    className="block text-label-lg font-semibold mb-1 text-right"
                    style={{ color: "#6B5B47" }}
                  >
                    {t("auth.register.email_label")}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors"
                      style={{ color: "#A37F41" }}
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder={t("auth.register.email_placeholder")}
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pr-14 py-4 border-2 rounded-xl transition-all duration-200 text-arabic-base text-right placeholder:text-right ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      style={{
                        borderColor: errors.email ? "#ef4444" : "#E5D5C3",
                        color: "#6B5B47",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#A37F41")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2D2B6")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-arabic-sm mt-1 animate-pulse text-right">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Enhanced Phone Field */}
                <div className="group" dir="rtl">
                  <label
                    className="block text-label-lg font-semibold mb-1 text-right"
                    style={{ color: "#6B5B47" }}
                  >
                    {t("auth.register.phone_label")}
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors"
                      style={{ color: "#A37F41" }}
                    />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`pr-14 py-4 border-2 rounded-xl transition-all duration-200 text-right placeholder:text-right ${
                        errors.phone ? "border-red-500" : ""
                      }`}
                      style={{
                        borderColor: errors.phone ? "#ef4444" : "#E5D5C3",
                        color: "#6B5B47",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#A37F41")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2D2B6")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-arabic-sm mt-2 animate-pulse text-right">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Enhanced Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label
                      className="block text-label-lg font-semibold mb-1"
                      style={{ color: "#6B5B47" }}
                    >
                      {t("auth.register.password_label")}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: "#A37F41" }}
                      />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.register.password_placeholder")}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-14 pr-14 py-4 border-2 rounded-xl transition-all duration-200 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.password ? "#ef4444" : "#E5D5C3",
                          color: "#6B5B47",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#A37F41")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#E5D5C3")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                        style={{ color: "#A37F41" }}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-arabic-sm mt-1 animate-pulse">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label
                      className="block text-label-lg font-semibold mb-2"
                      style={{ color: "#241C0F" }}
                    >
                      {t("auth.register.confirm_password_label")}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors"
                        style={{ color: "#A37F41" }}
                      />
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t(
                          "auth.register.confirm_password_placeholder"
                        )}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-14 pr-14 py-4 border-2 rounded-xl transition-all duration-200 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                        style={{
                          borderColor: errors.confirmPassword
                            ? "#B54A35"
                            : "#E2D2B6",
                          color: "#241C0F",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#A37F41")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#E5D5C3")}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                        style={{ color: "#A37F41" }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-arabic-sm mt-1 animate-pulse">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Terms Agreement */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded-lg focus:ring-2"
                    style={{
                      accentColor: "#A37F41",
                      borderColor: "#E5D5C3",
                    }}
                  />
                  <label
                    className="text-arabic-base font-medium"
                    style={{ color: "#6B5B47" }}
                  >
                    أوافق على{" "}
                    <Link
                      to="/terms"
                      className="underline decoration-2 underline-offset-2 hover:opacity-80 text-arabic-base"
                      style={{ color: "#A37F41" }}
                    >
                      الشروط والأحكام
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-arabic-sm animate-pulse">
                    {errors.agreeToTerms}
                  </p>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                    <p className="text-red-600 text-arabic-base font-medium">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Enhanced Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-5 text-button-lg font-semibold rounded-xl  hover: transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #8B6A35 0%, #A37F41 50%, #B8904F 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)";
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("auth.register.creating_account")}</span>
                    </div>
                  ) : (
                    t("auth.register.register_button")
                  )}
                </Button>

                {/* Enhanced Divider */}
                <div className="relative ">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className="w-full border-t-2"
                      style={{ borderColor: "#E5D5C3" }}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-arabic-base">
                    <span
                      className="px-6 bg-gradient-to-r from-[#FFF8E6] to-white font-medium text-arabic-base"
                      style={{ color: "#8A5700" }}
                    >
                      {t("auth.register.or_register_with")}
                    </span>
                  </div>
                </div>

                {/* Enhanced Social Login */}
                <div className="grid grid-cols-1 gap-4">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        await googleRegister(credentialResponse, userType);
                        console.log("Google login success");

                        navigate(ROUTES.HOME);
                      } catch (error) {
                        console.error("Google login error:", error);
                      }
                    }}
                    onError={() => {
                      console.error("Google login failed");
                    }}
                    className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>{t("auth.register.google_register")}</span>
                  </GoogleLogin>
                </div>

                {/* Enhanced Sign In Link */}
                <div className="text-center mt-6">
                  <span className="text-gray-600">
                    {t("auth.register.have_account")}{" "}
                  </span>
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-amber-600 hover:text-amber-700 font-semibold underline decoration-2 underline-offset-2 hover:decoration-amber-700 transition-all duration-200"
                  >
                    {t("auth.register.login_link")}
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Register;
