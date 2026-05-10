import { ChevronDown } from 'lucide-react'
import { getDrawerItems } from '../data/home.data'

export function HomeDrawer() {
  return (
    <aside className="border-r border-[#e6e9ef] bg-white px-4 py-4.5">
      {getDrawerItems().map((item) => {
        const active = item.key === 'overview'

        return (
          <button
            className={`grid min-h-14 w-full grid-cols-[24px_1fr_auto] items-center gap-3 bg-transparent text-left text-lg leading-tight ${
              active ? 'font-bold text-[#006fd5]' : 'text-[#34445b]'
            }`}
            key={item.key}
            type="button"
          >
            <span className={active ? 'text-[#006fd5]' : 'text-[#7a7f88]'}>
              {item.icon}
            </span>
            <span className="min-w-0">{item.label}</span>
            {item.badge ? (
              <span className="min-w-11 rounded-full bg-[#ff9f25] px-2.5 py-0.5 text-center text-xs font-bold text-white">
                {item.badge}
              </span>
            ) : null}
            {item.expandable ? (
              <ChevronDown className="h-3.5 w-3.5 text-[#243247]" />
            ) : null}
          </button>
        )
      })}
    </aside>
  )
}
