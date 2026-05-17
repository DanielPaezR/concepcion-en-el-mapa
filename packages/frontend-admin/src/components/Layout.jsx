import { Outlet, Link, useLocation } from 'react-router-dom'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
  PhotoIcon,
  BuildingLibraryIcon,
  QrCodeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'

// Logo de Concepción - puedes usar la URL de tu logo o importarlo
const LOGO_URL = '/logo512.png';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Lugares', href: '/admin/lugares', icon: MapPinIcon },
  { name: 'Eventos', href: '/admin/eventos', icon: CalendarIcon },
  { name: 'Reservas', href: '/admin/reservas', icon: CalendarIcon },
  { name: 'Guías', href: '/admin/guias', icon: UsersIcon },
  { name: 'Insignias', href: '/admin/insignias', icon: TrophyIcon },
  { name: 'Galería', href: '/admin/galeria', icon: PhotoIcon },
  { name: 'Ubicaciones', href: '/admin/ubicaciones', icon: BuildingLibraryIcon },
  { name: 'Escaneos QR', href: '/admin/escaneos', icon: QrCodeIcon },
  { name: 'Encuestas', href: '/admin/encuestas', icon: ClipboardDocumentListIcon },
  { name: 'Configuración', href: '/admin/configuracion', icon: Cog6ToothIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  // Cerrar sidebar automáticamente cuando cambie la ruta (en móvil)
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  const handleNavigation = () => {
    // En móvil, cerrar sidebar después de navegar
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  return (
    <div>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-10 w-auto"
                      src={LOGO_URL}
                      alt="Concepción en el Mapa"
                      onError={(e) => {
                        // Si la imagen falla, mostrar un texto alternativo
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-2xl">🏞️</span><span class="ml-2 text-xl font-semibold text-gray-900">Concepción</span>';
                      }}
                    />
                    <span className="ml-2 text-xl font-semibold text-gray-900">Admin</span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={handleNavigation}
                                className={classNames(
                                  location.pathname === item.href
                                    ? 'bg-green-50 text-green-600'
                                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    location.pathname === item.href
                                      ? 'text-green-600'
                                      : 'text-gray-400 group-hover:text-green-600',
                                    'h-5 w-5 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-10 w-auto"
              src={LOGO_URL}
              alt="Concepción en el Mapa"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-2xl">🏞️</span><span class="ml-2 text-xl font-semibold text-gray-900">Concepción Admin</span>';
              }}
            />
            <span className="ml-2 text-xl font-semibold text-gray-900">Admin</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-green-50 text-green-600'
                            : 'text-gray-700 hover:text-green-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            location.pathname === item.href
                              ? 'text-green-600'
                              : 'text-gray-400 group-hover:text-green-600',
                            'h-5 w-5 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 w-full"
                >
                  <ArrowRightOnRectangleIcon
                    className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600"
                    aria-hidden="true"
                  />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{user?.nombre || 'Administrador'}</div>
                <div className="text-xs text-gray-500">{user?.rol === 'admin' ? 'Administrador' : 'Guía'}</div>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                    {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                </Menu.Button>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}