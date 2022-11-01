import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import styles from "../styles/Swiper.module.scss";
import { IoCloseOutline } from "react-icons/io5";

function swiper({ setSwiperOn, images, clickImageIndex }) {
  return (
    <div className={styles.container}>
      <button
        className={styles.closeContainer}
        onClick={() => setSwiperOn(false)}
      >
        <IoCloseOutline />
      </button>
      <Swiper
        initialSlide={clickImageIndex}
        modules={[Navigation]}
        navigation
        speed={800}
        slidesPerView={1}
        loop
        className={styles.mySwiper}
      >
        {images.map((image) => (
          <SwiperSlide key={image.path} className={styles.swiperSlide}>
            <img src={image.url} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default swiper;
