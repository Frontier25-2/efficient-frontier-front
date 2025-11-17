"use client";

export default function Header() {
    return (
        <header style={{
            backgroundColor: '#132440',  // bg-[#132440]
            color: '#FFFFFF',             // text-[#FFFFFF]
            height: 120,
            paddingLeft: '80px',          // px-10 (10 * 4px = 40px)
            display: 'flex',              // flex
            justifyContent: 'space-between', // justify-between
            alignItems: 'center',         // items-center
        }}>
            {/* 왼쪽: 로고/타이틀 */}
            <div>
                <p style={{ fontSize: "30px", margin: 0, marginBottom: 15, }}>
                    AI 자산배분 분석 플랫폼
                </p>
                <p style={{ fontSize: "16px", margin: 0 }}>
                    데이터 기반 스마트 포트폴리오 관리
                </p>
            </div>
        </header>
    );
}