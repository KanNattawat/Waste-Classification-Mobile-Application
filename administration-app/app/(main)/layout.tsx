import Nav from "@/components/nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="grid grid-cols-6">
                <Nav/>
                <div className="col-span-5">
                    {children}
                </div>
            </div>
        </>
    );
}