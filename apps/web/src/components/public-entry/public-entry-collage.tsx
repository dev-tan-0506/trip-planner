import Image from "next/image";

const collageImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVAw_8C5H2l0Oc6LtOgTFabGZ7SvggeBUJMsM50NIIa9QXjZ8S9gaFT6Jpz_hNijfy-1XvAWw6uq1KyVFNgnansqZ2y7mVLJ93R67OeAsaS0LYTZfvxnZZOp0fO9Fcb_bJYEzKNELhQQicWSyNVX-bSWiKynaZoMBXoSplM7om11jtAm4a3yKx97JoVpY-uGbp55K_sVV01p-Hrv8BJB7GvWobxy8Cy6hbJ_qLUQOPq-7xh8pgo4jPOYeDbyMa59gkmhGKKFUmgxef",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCB3l000O-39W4ppKAIZI3HxE95YbY6gdc9jOn2PwzKd93H2TXaL0mo5MQvuJoWc5QeV-gD59F0CX9TLLebMcioS6X_WnEfhdxenhUiNFvneMQJp6R-fy8S82qs5PudWay5S6wuy8CCf7zjk70xpnPRhIYeRe_zRQs4x9tT1M-U9Oj5wVNYWglgB-cLN7Ll6-WwvgUKttBf1Ptvb5H_4RC-t5OOqwdrKdLPrZk_c9J0T3u9iCQ_QfDbVhHnnuwRZUQJYoT-p06WEPFD",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBS2R007b3mYJfa85NStVOEIdTL1M-FMqSsV1WDa_QmUeX38ghkucPykHPygm9BK6zysb_PwZ_whT7Tb2AN3zfvC4hUnqUqMXEzggZT2JxnQeX8XMYe9JNtD_A2FqVGN8kcyriFfncgOyqEKyVGI-7Y9CpBlfGV6_Ce3HObXWeQ0ymMZGlLbeTaLWcSfDYFIg4rHEPAVjt-pSv7QroJTf1Bt4MkzNtweGzgWTVtbEHh9UIbMhQnAkuDw_LHL5EcphkZY5wiAxPGJBy8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBIWYiVzpcxXFMm_pkAVFpeNxkGDxbTYJPPvL-S8FEGPZAWajlowLx78vQw8xI8J1UJLOf-u8xlMBeQJ5RVARnFs-_2ouDM1St8l9D2cuJmGq719X_n06prxDGlo0HuF3oMsbgoicDSQXSNlJu-_vuL9TcPgc1Dai9GFRXCR6GjvM3caWra7stjLmAP91FTVL6IIlk78HqkCnnbrngtaiS1Kmj6QgeAgnw6EyM5ZBNdgsKLrc7qDtZzD2j_9sdQ9Jid3i-77rcdGtyE",
];

export function PublicEntryCollage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-[-12%] rotate-[-5deg] scale-[1.1]">
        <div className="grid h-full w-full grid-cols-2 gap-4 opacity-95 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, index) => {
            const src = collageImages[index % collageImages.length]!;
            return (
              <Image
                key={`${src}-${index}`}
                alt="Vietnam travel collage"
                src={src}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="pe-collage-image"
              />
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0" />
      <div className="pe-collage-gradient" />
    </div>
  );
}
