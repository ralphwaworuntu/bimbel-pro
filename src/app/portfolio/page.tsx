import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function PortfolioPage() {
    const portfolios = [
        {
            title: "Bimbel Cerdas Mandiri",
            description: "Website bimbel SD-SMA dengan fitur tryout online.",
            image: "https://placehold.co/800x600/1e293b/white?text=Bimbel+Cerdas",
            link: "#",
        },
        {
            title: "English Fast Course",
            description: "Platform kursus bahasa Inggris dengan pendaftaran kelas otomatis.",
            image: "https://placehold.co/800x600/1e293b/white?text=English+Fast",
            link: "#",
        },
        {
            title: "Math Master",
            description: "Spesialis olimpiade matematika dengan integrasi video pembelajaran.",
            image: "https://placehold.co/800x600/1e293b/white?text=Math+Master",
            link: "#",
        },
        {
            title: "Science Club",
            description: "Komunitas belajar sains dengan forum diskusi interaktif.",
            image: "https://placehold.co/800x600/1e293b/white?text=Science+Club",
            link: "#",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Portfolio Hasil Karya</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Lihat bagaimana BimbelPro membantu bisnis bimbel lain tumbuh dengan website profesional.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {portfolios.map((item, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 hover:border-amber-500/50 transition-colors">
                            <div className="aspect-video relative overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full font-medium text-sm">
                                        Lihat Website
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
